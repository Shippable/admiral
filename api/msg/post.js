'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    component: 'msg',
  };

  bag.who = util.format('msg|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _post.bind(null, bag)
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
  if (_.has(bag.reqBody, 'uiUsername'))
    update.uiUsername = bag.reqBody.uiUsername;
  if (_.has(bag.reqBody, 'uiPassword'))
    update.uiPassword = bag.reqBody.uiPassword;
  if (_.has(bag.reqBody, 'username'))
    update.username = bag.reqBody.username;
  if (_.has(bag.reqBody, 'password'))
    update.password = bag.reqBody.password;
  if (_.has(bag.reqBody, 'isSecure'))
    update.isSecure = bag.reqBody.isSecure;

  // If 'password' was provided and there's no 'uiPassword' set both
  if (!bag.config.uiPassword && !update.uiPassword && bag.reqBody.password)
    update.uiPassword = bag.reqBody.password;

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
