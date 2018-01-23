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

  bag.who = util.format('workflowControllers|%s', self.name);
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

  var query = 'SELECT * FROM "workflowControllers"';
  var queries = [];

  if (_.has(bag.reqQuery, 'objectType'))
    queries.push(util.format('"objectType"=\'%s\'', bag.reqQuery.objectType));

  if (_.has(bag.reqQuery, 'objectId'))
    queries.push(util.format('"objectId"=\'%s\'', bag.reqQuery.objectId));

  if (queries.length)
    query = query + ' WHERE ' + queries.join(' AND ');

  bag.query = query;

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, workflowControllers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get workflowControllers with error: ' +
            util.inspect(err))
        );

      if (workflowControllers.rows)
        bag.resBody = workflowControllers.rows;

      return next();
    }
  );
}
