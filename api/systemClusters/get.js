'use strict';

var self = get;
module.exports = self;

var _ = require('underscore');
var async = require('async');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: []
  };

  bag.who = util.format('systemClusters|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _constructQuery.bind(null, bag),
      _getSystemClusters.bind(null, bag)
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

  // Can enhance the queries for other params if required in future.
  var query = 'SELECT * FROM "systemClusters"';
  var queries = [];

  if (_.has(bag.reqQuery, 'isDefault'))
    queries.push(util.format('"isDefault"=\'%s\'', bag.reqQuery.isDefault));

  if (queries.length)
    query = query + ' WHERE ' + queries.join(' AND ');

  bag.query = query;
  return next();
}

function _getSystemClusters(bag, next) {
  var who = bag.who + '|' + _getSystemClusters.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, systemClusters) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemClusters with error: ' + util.inspect(err))
        );

      if (systemClusters.rows)
        bag.resBody = systemClusters.rows;

      return next();
    }
  );
}
