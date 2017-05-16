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
      _postSystemIntegration.bind(null, bag)
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
      return next();
    }
  );
}

function _post(bag, next) {
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
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('name=state&masterName=gitlabCreds',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations) &&
        (!_.has(bag.reqBody, 'rootPassword') ||
       _.isEmpty(bag.reqBody.rootPassword)))
        return next(
          new ActErr(who, ActErr.ParamNotFound,
            'rootPassword is required for GitLab')
        );

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
    masterName: 'gitlabCreds',
    data: _generateSystemIntegrationData(bag)
  };

  bag.apiAdapter.putSystemIntegration(bag.systemIntegration.id, putObject,
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

  var who = bag.who + '|' + _postSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var postObject = {
    name: 'state',
    masterName: 'gitlabCreds',
    data: _generateSystemIntegrationData(bag)
  };

  bag.apiAdapter.postSystemIntegration(postObject,
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

function _generateSystemIntegrationData(bag) {
  var rootPassword = bag.reqBody.rootPassword;
  if (!rootPassword && bag.systemIntegration)
    rootPassword = bag.systemIntegration.data.password;

  var data = {
    username: 'root',
    password: rootPassword,
    url: util.format('http://%s/api/v3', bag.resBody.address),
    sshPort: util.format('%s', bag.resBody.sshPort),
    subscriptionProjectLimit: '100'
  };

  return data;
}
