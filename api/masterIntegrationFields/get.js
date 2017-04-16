'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {}
  };

  bag.who = util.format('masterIntegrationFields|%s', self.name);
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

  bag.query = 'SELECT * FROM "masterIntegrationFields"';

  if (bag.reqQuery.masterIntegrationIds) {
    var ids = _.map(bag.reqQuery.masterIntegrationIds.split(','),
      function (id) {
        return util.format('\'%s\'', id);
      }
    );

    bag.query = bag.query +
      util.format(' WHERE "masterIntegrationId" IN (%s)', ids.join(','));
  }

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, masterIntegrationFields) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      bag.resBody = masterIntegrationFields.rows;

      return next();
    }
  );
}
