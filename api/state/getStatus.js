'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');
var configHandler = require('../../common/configHandler.js');

var checkStatus = {
  amazonKeys: require('./s3/getStatus.js'),
  gitlabCreds: require('./gitlab/getStatus.js')
};

function getStatus(req, res) {
  var bag = {
    resBody: {
      isReachable: false,
      error: null
    },
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    component: 'state'
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getConfig.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _getRootBucket.bind(null, bag),
      _checkStatus.bind(null, bag)
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


function _getConfig(bag, next) {
  var who = bag.who + '|' + _getConfig.name;
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

      if (!bag.config.type)
        bag.config.type = 'gitlabCreds';

      return next();
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
            'No state system integration found')
        );

      bag.systemIntegration = systemIntegrations[0];
      return next();
    }
  );
}


function _getRootBucket(bag, next) {
  var who = bag.who + '|' + _getRootBucket.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemSettings(query,
    function (err, systemSettings) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system settings : ' + util.inspect(err))
        );

      bag.rootS3Bucket = systemSettings.rootS3Bucket;

      return next();
    }
  );
}

function _checkStatus(bag, next) {
  var who = bag.who + '|' + _checkStatus.name;
  logger.verbose(who, 'Inside');

  if (bag.config.type === 'none') {
    bag.resBody.isReachable = true;
    return next();
  }

  var checkStatusForType = checkStatus[bag.systemIntegration.masterName];

  if (!checkStatusForType)
    return next(
      new ActErr(who, ActErr.OperationFailed,
        'Invalid state config type: ' + bag.config.type)
    );

  var params = {
    systemIntegration: bag.systemIntegration,
    rootS3Bucket: bag.rootS3Bucket
  };

  checkStatusForType(params,
    function (err, resBody) {
      if (err)
        return next(err);

      bag.resBody = resBody;
      return next();
    }
  );
}
