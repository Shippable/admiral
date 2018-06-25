'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');
var APIAdapter = require('../../common/APIAdapter.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    component: 'state'
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _post.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _putSystemIntegration.bind(null, bag),
      _postSystemIntegration.bind(null, bag),
      _getPreviousSystemIntegration.bind(null, bag),
      _deleteSystemIntegration.bind(null, bag)
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

  if (_.has(bag.reqBody, 'type') &&
    !_.contains(['gitlabCreds', 'amazonKeys', 'none'], bag.reqBody.type))
    return next(
      new ActErr(who, ActErr.InvalidParam,
        'Invalid state type: ' + bag.reqBody.type)
    );

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, state) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(state))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );

      bag.config = state;

      if (!bag.config.type)
        bag.config.type = 'gitlabCreds';

      if (_.has(bag.reqBody, 'type') && bag.config.type !== bag.reqBody.type)
        bag.previousType = bag.config.type;

      return next();
    }
  );
}

function _post(bag, next) {
  /*jshint maxcomplexity:15 */
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  if (_.has(bag.reqBody, 'address'))
    bag.config.address = bag.reqBody.address;

  if (_.has(bag.reqBody, 'port'))
    bag.config.port = bag.reqBody.port;

  if (_.has(bag.reqBody, 'sshPort'))
    bag.config.sshPort = bag.reqBody.sshPort;

  if (_.has(bag.reqBody, 'securePort'))
    bag.config.securePort = bag.reqBody.securePort;

  if (_.has(bag.reqBody, 'isShippableManaged'))
    bag.config.isShippableManaged = bag.reqBody.isShippableManaged;

  if (_.has(bag.reqBody, 'type')) {
    if (bag.config.type === bag.reqBody.type)
      bag.config.type = bag.reqBody.type;
    else if (bag.config.type === 'none') {
      bag.config.type = bag.reqBody.type;
      bag.config.isInstalled = false;
      bag.config.isInitialized = false;
    } else if (bag.config.isInstalled || bag.config.isInitialized)
      return next(
        new ActErr(who, ActErr.InvalidParam,
          'Cannnot change type of initialized state')
      );
    else
      bag.config.type = bag.reqBody.type;
  }

  configHandler.put(bag.component, bag.config,
    function (err, config) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      bag.resBody = config;

      return next();
    }
  );
}

function _getSystemIntegration(bag, next) {
  if (bag.config.type === 'none') return next();
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations(
    'name=state&masterName=' + bag.config.type,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations)) {
        if (bag.config.type === 'gitlabCreds') {
          if (!_.has(bag.reqBody, 'rootPassword') ||
           _.isEmpty(bag.reqBody.rootPassword))
            return next(
              new ActErr(who, ActErr.ParamNotFound,
                'rootPassword is required for GitLab')
            );
        } else if (bag.config.type === 'amazonKeys') {
          if (_.isEmpty(bag.reqBody.accessKey))
            return next(
              new ActErr(who, ActErr.ParamNotFound,
                'accessKey is required for S3')
            );
          if (_.isEmpty(bag.reqBody.secretKey))
            return next(
              new ActErr(who, ActErr.ParamNotFound,
                'secretKey is required for S3')
            );
        }
        return next();
      }

      bag.systemIntegration = systemIntegrations[0];
      return next();
    }
  );
}

function _putSystemIntegration(bag, next) {
  if (!bag.systemIntegration) return next();

  var who = bag.who + '|' + _putSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var putObject = {
    name: 'state',
    masterName: bag.config.type,
    data: _generateSystemIntegrationData(bag)
  };

  bag.apiAdapter.putSystemIntegration(bag.systemIntegration.id, putObject,
    'skipServices=true',
    function (err, systemIntegration) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update system integration: ' + util.inspect(err))
        );

      bag.systemIntegration = systemIntegration;
      return next();
    }
  );
}

function _postSystemIntegration(bag, next) {
  if (bag.systemIntegration) return next();
  if (bag.config.type === 'none') return next();

  var who = bag.who + '|' + _postSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var postObject = {
    name: 'state',
    masterName: bag.config.type,
    data: _generateSystemIntegrationData(bag)
  };

  bag.apiAdapter.postSystemIntegration(postObject,
    'skipServices=true',
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _getPreviousSystemIntegration(bag, next) {
  if (bag.previousType === 'none') return next();
  var who = bag.who + '|' + _getPreviousSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations(
    'name=state&masterName=' + bag.previousType,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations))
        return next();

      bag.previousSystemIntegration = systemIntegrations[0];
      return next();
    }
  );
}

function _deleteSystemIntegration(bag, next) {
  if (!bag.previousSystemIntegration) return next();

  var who = bag.who + '|' + _deleteSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.deleteSystemIntegration(bag.previousSystemIntegration.id,
    'skipServices=true',
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create delete integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _generateSystemIntegrationData(bag) {
  var data = {};
  if (bag.config.type === 'gitlabCreds') {
    var rootPassword = bag.reqBody.rootPassword;
    if (!rootPassword && bag.systemIntegration)
      rootPassword = bag.systemIntegration.data.password;

    data = {
      username: 'root',
      password: rootPassword,
      url: util.format('http://%s/api/v3', bag.resBody.address),
      sshPort: util.format('%s', bag.resBody.sshPort),
      subscriptionProjectLimit: '100'
    };
  } else if (bag.config.type === 'amazonKeys') {
    var accessKey = bag.reqBody.accessKey;
    if (!accessKey && bag.systemIntegration)
      accessKey = bag.systemIntegration.data.accessKey;

    var secretKey = bag.reqBody.secretKey;
    if (!secretKey && bag.systemIntegration)
      secretKey = bag.systemIntegration.data.secretKey;

    data = {
      accessKey: accessKey,
      secretKey: secretKey
    };
  }

  return data;
}
