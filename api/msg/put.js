'use strict';

var self = put;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');

function put(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    res: res,
    component: 'msg'
  };

  bag.who = util.format('msg|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _put.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        respondWithError(bag.res, err);

      sendJSONResponse(bag.res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

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

function _put(bag, next) {
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  if (_.has(bag.reqBody, 'address'))
    bag.config.address = bag.reqBody.address;

  if (_.has(bag.reqBody, 'amqpPort'))
    bag.config.amqpPort = bag.reqBody.amqpPort;

  if (_.has(bag.reqBody, 'adminPort'))
    bag.config.adminPort = bag.reqBody.adminPort;

  if (_.has(bag.reqBody, 'isSecure'))
    bag.config.isSecure = bag.reqBody.isSecure;

  if (_.has(bag.reqBody, 'isShippableManaged'))
    bag.config.isShippableManaged = bag.reqBody.isShippableManaged;

  if (_.has(bag.reqBody, 'isProcessing'))
    bag.config.isProcessing = bag.reqBody.isProcessing;

  if (_.has(bag.reqBody, 'isFailed'))
    bag.config.isFailed = bag.reqBody.isFailed;

  if (_.has(bag.reqBody, 'isInstalled'))
    bag.config.isInstalled = bag.reqBody.isInstalled;

  if (_.has(bag.reqBody, 'isInitialized'))
    bag.config.isInitialized = bag.reqBody.isInitialized;

  configHandler.put(bag.component, bag.config,
    function (err, config) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update db config', err)
        );

      bag.resBody = config;
      return next();
    }
  );
}
