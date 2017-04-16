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

  bag.who = util.format('providers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _constructQuery.bind(null, bag),
      _getS.bind(null, bag)
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

  bag.query = 'SELECT * FROM "providers"';

  var queries = [];

  if (_.has(bag.reqQuery, 'providerIds')) {
    var ids = _.map(bag.reqQuery.providerIds.split(','),
      function (id) {
        return util.format('\'%s\'', id);
      }
    );

    queries.push(
      util.format('"id" IN (%s)', ids.join(','))
    );
  }

  if (_.has(bag.reqQuery, 'providerUrls')) {
    var providerUrls = _.map(bag.reqQuery.providerUrls.split(','),
      function (url) {
        return util.format('\'%s\'', url);
      }
    );

    queries.push(
      util.format('"url" IN (%s)', providerUrls.join(','))
    );
  }

  if (_.has(bag.reqQuery, 'providerUrlSlugs')) {
    var providerUrlSlugs = _.map(bag.reqQuery.providerUrlSlugs.split(','),
      function (slug) {
        return util.format('\'%s\'', slug);
      }
    );

    queries.push(
      util.format('"urlSlug" IN (%s)', providerUrlSlugs.join(','))
    );
  }

  if (queries.length)
    bag.query = bag.query + ' WHERE ' + queries.join(' AND ');

  return next();
}

function _getS(bag, next) {
  var who = bag.who + '|' + _getS.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, providers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (!_.isEmpty(providers.rows))
        bag.resBody = providers.rows;

      return next();
    }
  );
}
