'use strict';

var self = postInitialize;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');

var envHandler = require('../../common/envHandler.js');

function postInitialize(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {},
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: '',
    setServiceUserToken: false
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _post.bind(null, bag),
      _generateServiceUserToken.bind(null, bag),
      _setServiceUserToken.bind(null, bag)
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

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _generateServiceUserToken(bag, next) {
  var who = bag.who + '|' + _generateServiceUserToken.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.serviceUserTokenEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.serviceUserTokenEnv)
        );

      if (_.isEmpty(value)) {
        logger.debug('Empty service user token, generating a new token');
        bag.serviceUserToken = uuid.v4();
        bag.setServiceUserToken = true;
      } else {
        logger.debug('Found existing service user token');
        bag.serviceUserToken = value;
      }

      return next();
    }
  );
}

function _setServiceUserToken(bag, next) {
  if (!bag.setServiceUserToken) return next();

  var who = bag.who + '|' + _setServiceUserToken.name;
  logger.verbose(who, 'Inside');

  envHandler.put(bag.serviceUserTokenEnv, bag.serviceUserToken,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot set env: ' + bag.serviceUserTokenEnv + ' err: ' + err)
        );

      return next();
    }
  );
}
