'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {},
    initializeDefault: false,
    component: 'redis',
    defaultConfig: {
      address: global.config.admiralIP,
      port: 6379,
      isInstalled: false,
      isInitialized: false
    }
  };

  bag.who = util.format('redis|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _get.bind(null, bag),
    _setDefault.bind(null, bag)
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
    function (err, redis) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(redis)) {
        logger.debug('No configuration in database for ' + bag.component);
        bag.initializeDefault = true;
        return next();
      }

      bag.resBody = redis;
      return next();
    }
  );
}

function _setDefault(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _setDefault.name;
  logger.verbose(who, 'Inside');

  configHandler.put(bag.component, bag.defaultConfig,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      bag.resBody = bag.defaultConfig;
      return next();
    }
  );
}
