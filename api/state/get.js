'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');
var envHandler = require('../../common/envHandler.js');

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
      isShippableManaged: true,
      isInstalled: false,
      isInitialized: false
    }
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _get.bind(null, bag),
    _checkDevMode.bind(null, bag),
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
    function (err, state) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(state)) {
        logger.debug('No configuration in database for ' + bag.component);
        bag.initializeDefault = true;
        return next();
      }

      // If there is a state config with no type, assume it's GitLab.
      if (!state.type)
        state.type = 'gitlabCreds';

      bag.resBody = state;
      return next();
    }
  );
}

function _checkDevMode(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _checkDevMode.name;
  logger.verbose(who, 'Inside');

  envHandler.get('DEV_MODE',
    function (err, devMode) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: DEV_MODE')
        );

      bag.devMode = devMode;
      return next();
    }
  );
}


function _setDefault(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _setDefault.name;
  logger.verbose(who, 'Inside');

  if (bag.devMode)
    bag.defaultConfig.sshPort = 2222;

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
