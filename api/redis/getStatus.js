'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');
var redis = require('redis');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');

function getStatus(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {
      isReachable: false,
      error: null
    },
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    component: 'redis',
    redisUrl: null
  };

  bag.who = util.format('redis|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _connectToRedis.bind(null, bag),
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

function _getSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('name=redis&masterName=url',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No msg system integration found')
        );

      var systemIntegration = systemIntegrations[0];

      bag.redisUrl = systemIntegration.data.url;
      return next();
    }
  );
}

function _connectToRedis(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _connectToRedis.name;
  logger.verbose(who, 'Inside');

  var parsedRedisUrl = bag.redisUrl.split(':');
  var host = parsedRedisUrl[0];
  var port = parsedRedisUrl[1];

  var redisClient = redis.createClient(port, host, {});

  redisClient.on('ready',
    function () {
      logger.debug('Sucessfully connected to Redis server');
      redisClient.end(false);
      return next();
    }
  );

  redisClient.on('error',
    function (err) {
      logger.error('Redis Health Check: failed with error', err);
      bag.resBody.error =
        'Failed to connect to Redis with error ' + util.inspect(err);
      return next();
    }
  );

  redisClient.on('end',
    function () {
      logger.debug('Redis connection closed');
    }
  );
}

function _getStatus(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  bag.resBody.isReachable = true;

  return next();
}
