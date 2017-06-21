'use strict';

var self = initialize;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');

var genexecConfig = require('./genexecConfig.js');

function initialize(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    systemNodeId: null,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1])
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemSettings.bind(null, bag),
      _getSystemNode.bind(null, bag),
      _getSystemNodeRoleCode.bind(null, bag),
      _generateGenexecConfig.bind(null, bag)
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

  if (!bag.reqBody.id)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :id')
    );
  bag.systemNodeId = bag.reqBody.id;

  return next();
}

function _getSystemSettings(bag, next) {
  var who = bag.who + '|' + _getSystemSettings.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemSettings('',
    function (err, systemSettings) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system settings : ' + util.inspect(err))
        );

      bag.runMode = systemSettings.runMode;

      return next();
    }
  );
}

function _getSystemNode(bag, next) {
  var who = bag.who + '|' + _getSystemNode.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemNodes" WHERE id=\'%s\'',
    bag.systemNodeId);

  global.config.client.query(query,
    function (err, systemNodes) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemNode with error: ' + util.inspect(err))
        );

      if (_.isEmpty(systemNodes.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemNode not found for id: ' + bag.systemNodeId)
        );

      bag.execImage = _.first(systemNodes.rows).execImage;

      return next();
    }
  );
}

function _getSystemNodeRoleCode(bag, next) {
  var who = bag.who + '|' + _getSystemNodeRoleCode.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "code" FROM "systemCodes" WHERE '+
    '"group"=\'nodeType\' AND "name"=\'system\'';

  global.config.client.query(query,
    function (err, result) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to fetch systemNode roleCode', err)
        );

      if (_.isEmpty(result.rows) || !result.rows[0].code)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No code found for group: nodeType and name: system')
        );
      bag.systemNodeRoleCode = _.first(result.rows).code;
      logger.debug('systemNode role code is: ' + bag.systemNodeRoleCode);
      return next();
    }
  );
}

function _generateGenexecConfig(bag, next) {
  var who = bag.who + '|' + _generateGenexecConfig.name;
  logger.verbose(who, 'Inside');

  bag.serviceConfig = {
    image: bag.execImage,
    listenQueue: 'systemNodes.exec',
    nodeId: bag.systemNodeId,
    nodeTypeCode: bag.systemNodeRoleCode,
    runMode: bag.runMode
  };

  var params = {
    apiAdapter: bag.apiAdapter,
    config: bag.serviceConfig,
    name: 'genExec'
  };

  genexecConfig(params,
    function (err, config, runCommand) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to generate config for service: ' + params.name +
            ' with error: ' + err.message)
        );

      bag.serviceConfig = config;
      bag.runCommand = runCommand;

      logger.debug(util.format('Run command: %s', bag.runCommand));
      return next();
    }
  );
}
