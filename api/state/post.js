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
    component: 'state'
  };

  bag.who = util.format('state|%s', self.name);
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

  if (_.has(bag.reqBody, 'rootPassword'))
    bag.config.rootPassword = bag.reqBody.rootPassword;

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
