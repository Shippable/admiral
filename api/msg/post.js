'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var url = require('url');

var configHandler = require('../../common/configHandler.js');
var APIAdapter = require('../../common/APIAdapter.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    component: 'msg',
  };

  bag.who = util.format('msg|%s', self.name);
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
    function (err, msg) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(msg))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );

      bag.config = msg;
      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var update = {};

  if (_.has(bag.reqBody, 'address'))
    update.address = bag.reqBody.address;
  if (_.has(bag.reqBody, 'amqpPort'))
    update.amqpPort = bag.reqBody.amqpPort;
  if (_.has(bag.reqBody, 'adminPort'))
    update.adminPort = bag.reqBody.adminPort;
  if (_.has(bag.reqBody, 'isSecure'))
    update.isSecure = bag.reqBody.isSecure;
  if (_.has(bag.reqBody, 'isShippableManaged'))
    update.isShippableManaged = bag.reqBody.isShippableManaged;

  configHandler.put(bag.component, update,
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

  bag.apiAdapter.getSystemIntegrations('name=msg&masterName=rabbitmqCreds',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      // Return an error if we don't have a system integration or a password
      if (_.isEmpty(systemIntegrations) &&
       (!_.has(bag.reqBody, 'username') || _.isEmpty(bag.reqBody.username) ||
       !_.has(bag.reqBody, 'password') || _.isEmpty(bag.reqBody.password)))
        return next(
          new ActErr(who, ActErr.ParamNotFound,
            'Username and password are required for RabbitMQ')
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
    name: 'msg',
    masterName: 'rabbitmqCreds',
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
    name: 'msg',
    masterName: 'rabbitmqCreds',
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
  var username = bag.reqBody.username;
  var password = bag.reqBody.password;
  var existingAuth;

  if (bag.systemIntegration)
    existingAuth = url.parse(bag.systemIntegration.data.amqpUrl).auth;

  if (!username && existingAuth)
    username = existingAuth.split(':')[0];

  if (!password && existingAuth)
    password = existingAuth.split(':')[1];

  var amqpAddress = (bag.resBody.isSecure ? 'amqps://' : 'amqp://') +
    username + ':' + password +
    '@' + bag.resBody.address + ':' + bag.resBody.amqpPort;
  var httpAddress = (bag.resBody.isSecure ? 'https://' : 'http://') +
    username + ':' + password +
    '@' + bag.resBody.address + ':' + bag.resBody.adminPort;

  var data = {
    amqpUrl: amqpAddress + '/shippable',
    amqpUrlRoot: amqpAddress + '/shippableRoot',
    amqpUrlAdmin: httpAddress,
    amqpDefaultExchange: 'shippableEx',
    rootQueueList: 'core.charon|versions.trigger|core.nf|nf.email|' +
      'nf.hipchat|nf.irc|nf.slack|nf.webhook|nf.jira|core.braintree|core.certgen|' +
      'core.hubspotSync|core.marshaller|marshaller.ec2|core.sync|' +
      'job.request|job.trigger|cluster.init|steps.deploy|steps.manifest|' +
      'steps.provision|steps.rSync|steps.release|core.logup|www.signals|' +
      'core.segment|core.intercom'
  };

  return data;
}
