'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {},
    initializeDefault: false,
    component: 'state',
    defaultConfig: {
      address: global.config.admiralIP,
      port: 80,
      sshPort: 22,
      securePort: 443,
      rootPassword: '',
      isInstalled: false,
      isInitialized: false
    }
  };

  bag.who = util.format('state|%s', self.name);
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

  var query = util.format('SELECT %s from "systemConfigs"', bag.component);
  global.config.client.query(query,
    function (err, systemConfigs) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component, err)
        );

      if (!_.isEmpty(systemConfigs.rows) &&
        !_.isEmpty(systemConfigs.rows[0].state)) {
          logger.debug('Found configuration for ' + bag.component);

          var config = systemConfigs.rows[0].state;
          bag.resBody = JSON.parse(config);
      } else {
        logger.debug(
          'No configuration present in configs for ' + bag.component);
        bag.initializeDefault = true;
      }

      return next();
    }
  );
}

function _setDefault(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _setDefault.name;
  logger.verbose(who, 'Inside');

  var defaultConfig = JSON.stringify(bag.defaultConfig);
  var query =
    util.format('UPDATE "systemConfigs" set "%s"=\'%s\';',
      bag.component, defaultConfig);

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update ' + bag.component, err)
        );

      if (response.rowCount === 1) {
        logger.debug('Successfully added default value for ' + bag.component);
        bag.resBody = JSON.parse(defaultConfig);
      } else {
        logger.warn('Failed to get default value for ' + bag.component);
      }

      return next();
    }
  );
}
