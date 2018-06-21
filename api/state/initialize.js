'use strict';

var self = initialize;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');
var configHandler = require('../../common/configHandler.js');

var checkConfig = {
  gitlabCreds: require('./gitlab/checkConfig.js')
};

var initializeState = {
  amazonKeys: require('./s3/initialize.js'),
  gitlabCreds: require('./gitlab/initialize.js')
};

function initialize(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: [],
    res: res,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    skipStatusChange: false,
    params: {},
    component: 'state',
    tmpScript: '/tmp/state.sh'
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _checkConfig.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _sendResponse.bind(null, bag),
      _getReleaseVersion.bind(null, bag),
      _initializeState.bind(null, bag),
      _checkCredentials.bind(null, bag),
      _post.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (!bag.skipStatusChange)
        _setCompleteStatus(bag, err);

      if (err) {
        // only send a response if we haven't already
        if (!bag.isResponseSent)
          respondWithError(bag.res, err);
        else
          logger.warn(err);
      }
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
      if (err) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );
      }

      if (_.isEmpty(state)) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );
      }

      bag.config = state;

      if (!bag.config.type)
        bag.config.type = 'gitlabCreds';

      return next();
    }
  );
}

function _checkConfig(bag, next) {
  if (bag.config.type === 'none') return next();
  var who = bag.who + '|' + _checkConfig.name;
  logger.verbose(who, 'Inside');

  var checkConfigForType = checkConfig[bag.config.type];

  if (!checkConfigForType)
    return next();

  checkConfigForType(bag.config,
    function (err) {
      return next(err);
    }
  );
}

function _getSystemIntegration(bag, next) {
  if (bag.config.type === 'none') return next();
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations(
    'name=state&masterName=' + bag.config.type,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No systemIntegration found for state. Please POST a state config.'
          )
        );

      bag.systemIntegration = systemIntegrations[0];
      return next();
    }
  );
}

function _setProcessingFlag(bag, next) {
  var who = bag.who + '|' + _setProcessingFlag.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: true,
    isFailed: false
  };

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      return next();
    }
  );
}

function _sendResponse(bag, next) {
  var who = bag.who + '|' + _sendResponse.name;
  logger.verbose(who, 'Inside');

  // We reply early so the request won't time out while
  // waiting for the service to start.

  sendJSONResponse(bag.res, bag.resBody, 202);
  bag.isResponseSent = true;
  return next();
}

function _getReleaseVersion(bag, next) {
  var who = bag.who + '|' + _getReleaseVersion.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemSettings(query,
    function (err, systemSettings) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system settings : ' + util.inspect(err))
        );

      bag.releaseVersion = systemSettings.releaseVersion;
      bag.rootS3Bucket = systemSettings.rootS3Bucket;

      return next();
    }
  );
}

function _initializeState(bag, next) {
  if (bag.config.type === 'none') return next();
  var who = bag.who + '|' + _initializeState.name;
  logger.verbose(who, 'Inside');

  var initializeStateForType = initializeState[bag.config.type];

  if (!initializeStateForType)
    return next();

  var params = {
    config: bag.config,
    systemIntegration: bag.systemIntegration,
    releaseVersion: bag.releaseVersion,
    rootS3Bucket: bag.rootS3Bucket
  };

  initializeStateForType(params,
    function (err) {
      return next(err);
    }
  );
}

function _checkCredentials(bag, next) {
  if (bag.config.isShippableManaged) return next();

  var who = bag.who + '|' + _checkCredentials.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getStateStatus(
    function (err, status) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to check state credentials: ' + util.inspect(err))
        );

      if (status.error)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Invalid state credentials: ' + status.error)
        );

      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var update = {
    isInstalled: true,
    isInitialized: true
  };

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      return next();
    }
  );
}

function _setCompleteStatus(bag, err) {
  var who = bag.who + '|' + _setCompleteStatus.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: false
  };
  if (err)
    update.isFailed = true;
  else
    update.isFailed = false;

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        logger.warn(err);
    }
  );
}
