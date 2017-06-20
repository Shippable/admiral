'use strict';

var self = post;
module.exports = self;

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    friendlyName: null,
    execImage: null
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemSettings.bind(null, bag),
      _post.bind(null, bag),
      _getSystemNode.bind(null, bag)
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

  if (!bag.reqBody.friendlyName)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :friendlyName')
    );
  bag.friendlyName = bag.reqBody.friendlyName;

  if (!bag.reqBody.execImage)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :execImage')
    );
  bag.execImage = bag.reqBody.execImage;

  if (global.config.admiralIP !== 'localhost' &&
    global.config.admiralIP !== '127.0.0.1')
    return next(
      new ActErr(who, ActErr.OperationFailed, util.format('Unable to POST '+
        'system node on %s', global.config.admiralIP))
    );

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

      if (systemSettings.runMode !== 'dev')
        return next(
          new ActErr(who, ActErr.OperationFailed, util.format('Unable to ' +
            'POST system node on run mode: %s', systemSettings.runMode))
        );

      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  bag.systemNodeId = mongoose.Types.ObjectId().toString();

  var insertStatement = util.format('INSERT INTO "systemNodes" ("id", ' +
    '"friendlyName", "execImage", "isShippableInitialized", "createdBy", ' +
    '"updatedBy", "createdAt", "updatedAt") values (\'%s\', \'%s\', \'%s\', ' +
    ' true, \'54188262bc4d591ba438d62a\', \'54188262bc4d591ba438d62a\',' +
    ' CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    bag.systemNodeId, bag.friendlyName, bag.execImage);

  global.config.client.query(insertStatement,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to create systemNode with error: ' + util.inspect(err))
        );

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

      logger.debug('Found systemNode ' + bag.systemNodeId);

      bag.resBody = systemNodes.rows[0];
      return next();
    }
  );
}
