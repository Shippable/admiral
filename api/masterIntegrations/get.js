'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function get(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    reqQuery: req.query,
    resBody: []
  };

  bag.who = util.format('masterIntegrations|%s', self.name);
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

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  return next();
}

function _constructQuery(bag, next) {
  var who = bag.who + '|' + _constructQuery.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "masterIntegrations"';
  var queries = [];

  if (_.has(bag.reqQuery, 'isEnabled'))
    queries.push(util.format('"isEnabled"=%s', bag.reqQuery.isEnabled));

  if (queries.length)
    query = query + ' WHERE ' + queries.join(' AND ');

  bag.query = query;
  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, masterIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get masterIntegrations with error: ' + util.format(err))
        );
      if (!_.isEmpty(masterIntegrations.rows))
        bag.resBody = masterIntegrations.rows;
      return next();
    }
  );
}
