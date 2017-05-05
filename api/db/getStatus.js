'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');
var pg = require('pg');

function getStatus(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {
      isReachable: false,
      error: null
    }
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _createClient.bind(null, bag),
    _getStatus.bind(null, bag)
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

function _createClient(bag, next) {
  var who = bag.who + '|' + _createClient.name;
  logger.debug(who, 'Inside');

  var connectionString = util.format('%s://%s:%s@%s:%s/%s',
    global.config.dbDialect,
    global.config.dbUsername,
    global.config.dbPassword,
    global.config.dbHost,
    global.config.dbPort,
    global.config.dbName);

  var testClient = new pg.Client(connectionString);
  testClient.connect(
    function (err) {
      if (err) {
        logger.error('Error while connecting to database. ' +
          util.inspect(err));
        bag.resBody.isReachable = false;
        bag.resBody.error = util.inspect(err);
      }
      return next();
    }
  );
}

function _getStatus(bag, next) {
  if (!bag.resBody.isReachable) return next();

  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  bag.resBody.isReachable = true;

  return next();
}
