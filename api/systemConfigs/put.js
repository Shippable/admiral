'use strict';

var self = put;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function put(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('systemConfigs|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _put.bind(null, bag),
      _getSystemConfig.bind(null, bag)
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

  if (!bag.inputParams.systemConfigId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route param not found :systemConfigId')
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
        value = util.format("'%s'", value);

      updates.push(
        util.format('"%s"=%s', key, value)
      );
    }
  );

  updates = updates.join(', ');

  var query = util.format('UPDATE "systemConfigs" SET %s WHERE id=\'%s\'',
    updates, bag.inputParams.systemConfigId);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      return next();
    }
  );
}

function _getSystemConfig(bag, next) {
  var who = bag.who + '|' + _getSystemConfig.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemConfigs" WHERE id=\'%s\'',
    bag.inputParams.systemConfigId);

  global.config.client.query(query,
    function (err, systemConfigs) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (_.isEmpty(systemConfigs.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemConfigs not found for id: ' +
             bag.inputParams.systemConfigId)
        );

      logger.debug('Found systemConfigs for ' +
        bag.inputParams.systemConfigId);

      bag.resBody = systemConfigs.rows[0];
      return next();
    }
  );
}
