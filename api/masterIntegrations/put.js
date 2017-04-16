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

  bag.who = util.format('masterIntegrations|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _put.bind(null, bag),
      _getMasterIntegration.bind(null, bag)
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

  if (!bag.inputParams.masterIntegrationId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route param not found :masterIntegrationId')
    );

  if (!_.isBoolean(bag.reqBody.isEnabled))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data or wrong type :isEnabled')
    );

  return next();
}

function _put(bag, next) {
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  var query = util.format('UPDATE "masterIntegrations" SET "isEnabled"=%s ' +
    'WHERE id=\'%s\'',
    bag.reqBody.isEnabled, bag.inputParams.masterIntegrationId);

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

function _getMasterIntegration(bag, next) {
  var who = bag.who + '|' + _getMasterIntegration.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "masterIntegrations" WHERE id=\'%s\'',
    bag.inputParams.masterIntegrationId);

  global.config.client.query(query,
    function (err, masterIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (_.isEmpty(masterIntegrations.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'Master Integration not found for masterIntegrationId: ' +
             bag.inputParams.masterIntegrationId)
        );

      logger.debug('Found master integration for ' +
        bag.inputParams.masterIntegrationId);

      bag.resBody = masterIntegrations.rows[0];
      return next();
    }
  );
}
