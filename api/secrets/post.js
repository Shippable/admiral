'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');
var envHandler = require('../../common/envHandler.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: [],
    component: 'secrets'
  };

  bag.who = util.format('secrets|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _post.bind(null, bag),
      _setVaultRootToken.bind(null, bag)
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
    function (err, secrets) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(secrets))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );

      bag.config = secrets;
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

function _setVaultRootToken(bag, next) {
  if (!bag.reqBody.rootToken) return next();

  var who = bag.who + '|' + _setVaultRootToken.name;
  logger.verbose(who, 'Inside');

  envHandler.put('VAULT_TOKEN', bag.reqBody.rootToken,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to set VAULT_TOKEN with error: ' + err)
        );

      return next();
    }
  );
}
