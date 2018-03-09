'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: []
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _constructQuery.bind(null, bag),
      _get.bind(null, bag)
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
  var query = 'SELECT * FROM "systemNodes"';
  var queries = [];

  if (_.has(bag.reqQuery, 'systemClusterId'))
    queries.push(util.format('"systemClusterId"=\'%s\'', bag.reqQuery.systemClusterId));

  if (queries.length)
    query = query + ' WHERE ' + queries.join(' AND ');

  bag.query = query;
  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, systemNodes) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemNodes with error: ' + util.format(err))
        );
      if (!_.isEmpty(systemNodes.rows))
        bag.resBody = systemNodes.rows;
      return next();
    }
  );
}
