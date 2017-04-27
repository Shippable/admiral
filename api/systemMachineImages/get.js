'use strict';

var self = getS;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function getS(req, res) {
  var bag = {
    inputParams: req.params,
    reqQuery: req.query,
    resBody: []
  };

  bag.who = util.format('systemMachineImages|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _constructQuery.bind(null, bag),
      _getSystemMachineImages.bind(null, bag)
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

function _constructQuery(bag, next) {
  var who = bag.who + '|' + _constructQuery.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "systemMachineImages"';
  var queries = [];

  if (_.has(bag.reqQuery, 'externalId'))
    queries.push(util.format('"externalId"=\'%s\'', bag.reqQuery.externalId));

  if (_.has(bag.reqQuery, 'provider'))
    queries.push(util.format('"provider"=\'%s\'', bag.reqQuery.provider));

  if (_.has(bag.reqQuery, 'isDefault'))
    queries.push(util.format('"isDefault"=%s', bag.reqQuery.isDefault));

  if (_.has(bag.reqQuery, 'isAvailable'))
    queries.push(util.format('"isAvailable"=%s', bag.reqQuery.isAvailable));

  if (queries.length)
    query = query + ' WHERE ' + queries.join(' AND ');

  bag.query = query;
  return next();
}


function _getSystemMachineImages(bag, next) {
  var who = bag.who + '|' + _getSystemMachineImages.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemMachineImages with error: ' +
            util.inspect(err))
        );

      if (systemIntegrations.rows)
        bag.resBody = systemIntegrations.rows;

      return next();
    }
  );
}
