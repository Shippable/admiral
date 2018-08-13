'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');
var pg = require('pg');
var _ = require('underscore');
var configHandler = require('../../common/configHandler.js');

function getStatus(req, res) {
  var bag = {
    reqQuery: req.query,
    component: 'db',
    testClient: null,
    resBody: {
      ip: '',
      port: '',
      uptime: '',
      isReachable: false,
      isShippableManaged: true,
      error: null
    }
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _getConfig.bind(null, bag),
    _createClient.bind(null, bag),
    _checkUptime.bind(null, bag),
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

function _getConfig(bag, next) {
  var who = bag.who + '|' + _getConfig.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, db) {
      if (err) {
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );
      }

      if (_.isEmpty(db)) {
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );
      }

      bag.config = db;
      return next();
    }
  );
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

  bag.testClient = new pg.Client(connectionString);
  bag.testClient.connect(
    function (err) {
      if (err) {
        logger.error('Error while connecting to database. ' +
          util.inspect(err));
        bag.resBody.isReachable = false;
        bag.resBody.error = util.inspect(err);
      } else {
        bag.resBody.isReachable = true;
      }
      return next();
    }
  );
}

function _checkUptime(bag, next) {
  var who = bag.who + '|' + _checkUptime.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT now() - pg_postmaster_start_time();');
  bag.testClient.query(query,
    function (err, uptime) {
      if (err) {
        return next(
          new ActErr(self, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component + ' with error ' + util.format(err)
          )
        );
      }

      if (!_.isEmpty(uptime.rows)){
        bag.resBody.uptime = JSON.parse(uptime.rows[0]);
      }

      return next(null);
    }
  );
}

function _getStatus(bag, next) {
  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  bag.resBody.ip = global.config.dbHost;
  bag.resBody.port = global.config.dbPort;
  bag.resBody.isShippableManaged = bag.config.isShippableManaged;

  return next();
}
