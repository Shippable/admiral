'use strict';

var self = getS;
module.exports = self;

var async = require('async');
var pg = require('pg');

function getS(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: []
  };

  bag.who = util.format('systemConfigs|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
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

function _getS(bag, next) {
  var who = bag.who + '|' + _getS.name;
  logger.verbose(who, 'Inside');

  var client = new pg.Client(global.config.connectionString);

  client.connect();
  var query = client.query('SELECT * from "systemConfigs"');

  query.on('end',
    function(systemConfigs) {
      client.end();
      bag.resBody = systemConfigs.rows;
      return next();
    }
  );
}
