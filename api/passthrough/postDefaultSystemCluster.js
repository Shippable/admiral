'use strict';

var self = postDefaultSystemCluster;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');

function postDefaultSystemCluster(req, res) {
  var bag = {
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('postDefaultSystemCluster|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemSettings.bind(null, bag),
      _getSystemCodes.bind(null, bag),
      _getDefaultSystemCluster.bind(null, bag),
      _getRuntimeTemplates.bind(null, bag),
      _postDefaultSystemCluster.bind(null, bag)
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

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  if (!bag.reqBody.defaultClusterType)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route parameter not found :defaultClusterType')
    );

  return next();
}

function _getSystemSettings(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemSettings(query,
    function (err, systemSettings) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemSettings:' + util.inspect(err));

      if (_.isEmpty(systemSettings))
        return next(who, ActErr.DBEntityNotFound, 'No system settings found.');

      if (!systemSettings.allowSystemNodes)
        return next(who, ActErr.OperationFailed,
          'allowSystemNodes should be set to true.');

      return next();
    }
  );
}

function _getSystemCodes(bag, next) {
  var who = bag.who + '|' + _getSystemCodes.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemCodes(query,
    function (err, systemCodes) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemCodes:' + util.inspect(err));

      if (_.isEmpty(systemCodes))
        return next(who, ActErr.DBEntityNotFound, 'No system codes found.');

      bag.clusterTypes = _.filter(systemCodes, {group: 'clusterType'});
      bag.archTypes = _.filter(systemCodes, {group: 'archType'});
      bag.osTypes = _.filter(systemCodes, {group: 'osType'});

      return next();
    }
  );
}

function _getDefaultSystemCluster(bag, next) {
  var who = bag.who + '|' + _getDefaultSystemCluster.name;
  logger.verbose(who, 'Inside');

  var query = 'isDefault=true';
  bag.apiAdapter.getSystemClusters(query,
    function (err, systemClusters) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemClusters:' + util.inspect(err));

      if (systemClusters)
        bag.defaultSystemCluster = _.first(systemClusters);

      return next();
    }
  );
}

function _getRuntimeTemplates(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _getRuntimeTemplates.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getRuntimeTemplates(
    function (err, runtimeTemplates) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get runtimeTemplates:' + util.inspect(err));

      if (!_.isEmpty(runtimeTemplates))
        bag.runtimeTemplates = runtimeTemplates;
      return next();
    }
  );
}

function _postDefaultSystemCluster(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();
  if (_.isEmpty(bag.runtimeTemplates)) return next();

  var who = bag.who + '|' + _postDefaultSystemCluster.name;
  logger.verbose(who, 'Inside');

  var clusterTypeCode = _.findWhere(bag.clusterTypes,
    {'name': bag.reqBody.defaultClusterType}).code;

  var selectedCluster = bag.reqBody.defaultClusterType.split('__');

  var defaulClusterArchCode = _.findWhere(bag.archTypes,
    {'name': selectedCluster[1]}).code;

  var defaultClusterOSCode = _.findWhere(bag.osTypes,
    {'name': selectedCluster[2]}).code;

  var runtimeTemplate = _.findWhere(bag.runtimeTemplates,
    {'osTypeCode': defaultClusterOSCode,
    'archTypeCode': defaulClusterArchCode, 'isDefault': true}
  );

  var newSystemCluster = {
    name: 'default_shared_node_pool',
    clusterTypeCode: clusterTypeCode,
    runtimeTemplateId: runtimeTemplate.id,
    queueName: 'systemNodes.exec',
    isDefault: true
  };

  bag.apiAdapter.postSystemCluster(newSystemCluster,
    function (err, systemCluster) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to post systemCluster:' + util.inspect(err));

      bag.resBody = systemCluster;
      return next();
    }
  );
}
