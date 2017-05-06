'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');
var VaultAdapter = require('../../common/VaultAdapter.js');

function getStatus(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {
      isReachable: false,
      error: null
    },
    component: 'secrets'
  };

  bag.who = util.format('secrets|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _get.bind(null, bag),
    _createClient.bind(null, bag),
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
      bag.vaultUrl = util.format('http://%s:%s',
        bag.config.address, bag.config.port);
      return next();
    }
  );
}

function _createClient(bag, next) {
  var who = bag.who + '|' + _createClient.name;
  logger.debug(who, 'Inside');

  bag.vaultAdapter = new VaultAdapter(
    bag.vaultUrl, bag.config.rootToken);

  return next();
}

function _getStatus(bag, next) {
  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  bag.vaultAdapter.getHealth(
    function (err, response) {
      if (err && err.code === 'ECONNREFUSED') {
        bag.resBody.isReachable = false;
        bag.resBody = _.extend(bag.resBody, err);
      } else if (err) {
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to check status for ' + bag.component, err)
        );
      } else {
        bag.resBody.isReachable = true;
        bag.resBody = _.extend(bag.resBody, response);
      }

      return next();
    }
  );
}
