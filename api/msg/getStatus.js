'use strict';

var self = getStatus;
module.exports = self;

var amqp = require('amqp');
var async = require('async');
var _ = require('underscore');
var url = require('url');

var RabbitMQAdapter = require('../../common/RabbitMQAdapter.js');
var APIAdapter = require('../../common/APIAdapter.js');

function getStatus(req, res) {
  var bag = {
    resBody: {
      isReachable: false,
      error: null
    },
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    component: 'msg',
    shippableConnection: null,
    shippableRootConnection: null,
    amqpUrl: null,
    amqpUrlRoot: null,
    amqpUrlAdmin: null,
    amqpDefaultExchange: null
  };

  bag.who = util.format('msg|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _connectToShippableAMQP.bind(null, bag),
      _disconnectShippableAMQP.bind(null, bag),
      _connectToShippableRootAMQP.bind(null, bag),
      _disconnectShippableRootAMQP.bind(null, bag),
      _getRabbitMQAdminUser.bind(null, bag),
      _checkRabbitMQAdminPermissions.bind(null, bag),
      _getStatus.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return respondWithError(res, err);

      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _getSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('name=msg&masterName=rabbitmqCreds',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No msg system integration found')
        );

      bag.systemIntegration = systemIntegrations[0];

      bag.amqpUrl = bag.systemIntegration.data.amqpUrl;
      bag.amqpUrlRoot = bag.systemIntegration.data.amqpUrlRoot;
      bag.amqpUrlAdmin = bag.systemIntegration.data.amqpUrlAdmin;
      bag.amqpDefaultExchange = bag.systemIntegration.data.amqpDefaultExchange;
      return next();
    }
  );
}

function _connectToShippableAMQP(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _connectToShippableAMQP.name;
  logger.verbose(who, 'Inside');

  bag.shippableConnection = amqp.createConnection({
    url: bag.amqpUrl,
    heartbeat: 60
  }, {
    defaultExchangeName: bag.amqpDefaultExchange,
    reconnect: false
  });

  bag.shippableConnection.on('ready',
    function () {
      logger.verbose('Connected to RabbitMQ');
      return next();
    }
  );

  bag.shippableConnection.on('error',
    function (err) {
      if (bag.shippableConnection) {
        var message = util.format(
          'Failed to connect to RabbitMQ with error: %s', util.inspect(err));
        logger.error(message);
        bag.resBody.error = message;
        return next();
      }
    }
  );
}

function _disconnectShippableAMQP(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _disconnectShippableAMQP.name;
  logger.debug(who, 'Inside');

  var error;

  try {
    bag.shippableConnection.disconnect();
  } catch (ex) {
    logger.warn('Failed to close connection to RabbitMQ');
    error = ex;
  }

  if (!error) {
    bag.shippableConnection = null;
    logger.verbose('Closed connection to RabbitMQ');
  }

  return next();
}

function _connectToShippableRootAMQP(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _connectToShippableRootAMQP.name;
  logger.verbose(who, 'Inside');

  bag.shippableRootConnection = amqp.createConnection({
    url: bag.amqpUrlRoot,
    heartbeat: 60
  }, {
    defaultExchangeName: bag.amqpDefaultExchange,
    reconnect: false
  });

  bag.shippableRootConnection.on('ready',
    function () {
      logger.verbose('Connected to RabbitMQ');
      return next();
    }
  );

  bag.shippableRootConnection.on('error',
    function (err) {
      if (bag.shippableRootConnection) {
        var message = util.format(
          'Failed to connect to RabbitMQ with error: %s', util.inspect(err));
        logger.error(message);
        bag.resBody.error = message;
        return next();
      }
    }
  );
}

function _disconnectShippableRootAMQP(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _disconnectShippableRootAMQP.name;
  logger.debug(who, 'Inside');

  var error;

  try {
    bag.shippableRootConnection.disconnect();
  } catch (ex) {
    logger.warn('Failed to close connection to RabbitMQ');
    error = ex;
  }

  if (!error) {
    bag.shippableRootConnection = null;
    logger.verbose('Closed connection to RabbitMQ');
  }
  return next();
}

function _getRabbitMQAdminUser(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _checkRabbitMQAdminPermissions.name;
  logger.verbose(who, 'Inside');

  bag.rabbitMQAdapter = new RabbitMQAdapter(bag.amqpUrlAdmin);
  var auth = url.parse(bag.amqpUrlAdmin).auth;
  if (!auth)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing auth in amqpUrlAdmin')
    );
  bag.adminName = auth.split(':')[0];

  bag.rabbitMQAdapter.getUser(bag.adminName,
    function (err, user) {
      if (err) {
        bag.resBody.error = util.format(
          'Failed to get user %s with amqpUrlAdmin', bag.adminName);
        return next();
      }

      if (!user.tags) {
        bag.resBody.error = util.format('%s does not have tags', bag.adminName);
        return next();
      }

      var tags = user.tags.split(',');

      if (!_.contains(tags, 'administrator'))
        bag.resBody.error = util.format(
          '%s does not have the administrator tag', bag.adminName);

      return next();
    }
  );
}

function _checkRabbitMQAdminPermissions(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _checkRabbitMQAdminPermissions.name;
  logger.verbose(who, 'Inside');

  bag.rabbitMQAdapter.getUserPermissions(bag.adminName,
    function (err, permissions) {
      if (err) {
        bag.resBody.error = util.format(
          'Failed to get user permissions for %s with amqpUrlAdmin',
          bag.adminName);
        return next();
      }

      var shippablePermission = _.findWhere(permissions, {vhost: 'shippable'});
      var shippableRootPermission =
        _.findWhere(permissions, {vhost: 'shippableRoot'});

      if (!shippablePermission)
        shippablePermission =
          {vhost: 'shippable', configure: null, write: null, read: null};
      if (!shippableRootPermission)
        shippableRootPermission =
          {vhost: 'shippableRoot', configure: null, write: null, read: null};

      var missingPermissions = [];

      _.each([shippablePermission, shippableRootPermission],
        function (permission) {
          if (permission.configure !== '.*')
            missingPermissions.push(
              util.format('%s does not have %s permission ".*" on vhost %s',
                bag.adminName, 'configure', permission.vhost)
            );

          if (permission.write !== '.*')
            missingPermissions.push(
              util.format('%s does not have %s permission ".*" on vhost %s',
                bag.adminName, 'write', permission.vhost)
            );

          if (permission.read !== '.*')
            missingPermissions.push(
              util.format('%s does not have %s permission ".*" on vhost %s',
                bag.adminName, 'read', permission.vhost)
            );
        }
      );

      if (missingPermissions.length)
        bag.resBody.error = 'The following permissions are missing: ' +
          missingPermissions.join();

      return next();
    }
  );
}

function _getStatus(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  bag.resBody.isReachable = true;

  return next();
}
