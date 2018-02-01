'use strict';

var self = put;
module.exports = self;

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

function put(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series(
    [
      _checkInputParams.bind(null, bag),
      _put.bind(null, bag),
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

  if (!bag.inputParams.systemNodeId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route param not found :systemNodeId')
    );

  return next();
}

function _put(bag, next) {
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  var updates = [];

  _.each(bag.reqBody,
    function (value, key) {
      if (_.isString(value))
        value = util.format('\'%s\'', value);

      updates.push(
        util.format('"%s"=%s', key, value)
      );
    }
  );

  updates = updates.join(', ');

  var query = util.format('UPDATE "systemNodes" SET %s WHERE id=\'%s\'',
    updates, bag.inputParams.systemNodeId);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update systemNode with error: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _getSystemNode(bag, next) {
  var who = bag.who + '|' + _getSystemNode.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemNodes" WHERE id=\'%s\'',
    bag.inputParams.systemNodeId);

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
