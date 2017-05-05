'use strict';

var self = initialize;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');

function initialize(req, res) {
  var bag = {
    reqQuery: req.query,
    reqBody: req.body,
    res: res,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    msgInitialized: false
  };

  bag.who = util.format('workflow|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _sendResponse.bind(null, bag),
      _initializeDatabase.bind(null, bag),
      _getSecrets.bind(null, bag),
      _initializeSecrets.bind(null, bag),
      _getMsg.bind(null, bag),
      _postMsg.bind(null, bag),
      _initializeMsg.bind(null, bag),
      _getState.bind(null, bag),
      _initializeState.bind(null, bag),
      _getRedis.bind(null, bag),
      _initializeRedis.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        logger.warn(err);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  var error = null;

  if (!_.has(bag.reqBody, 'msgPassword') ||
    _.isEmpty(bag.reqBody.msgPassword))
    error = new ActErr(who, ActErr.DataNotFound,
      'Missing body data: msgPassword');

  if (!error && (!_.has(bag.reqBody, 'statePassword') ||
    _.isEmpty(bag.reqBody.statePassword)))
    error = new ActErr(who, ActErr.DataNotFound,
      'Missing body data: statePassword');

  if (error) {
    // We will respond in either this function or the next, not at the end,
    // to avoid timeouts.
    respondWithError(bag.res, error);
    return next(error);
  }

  return next();
}

function _sendResponse(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  // We reply early so the request won't time out pulling images.

  sendJSONResponse(bag.res, bag.resBody);
  return next();
}

function _initializeDatabase(bag, next) {
  var who = bag.who + '|' + _initializeDatabase.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.postDB({},
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to initialize database.', err)
        );

      return next();
    }
  );
}

function _getSecrets(bag, next) {
  var who = bag.who + '|' + _getSecrets.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSecrets(
    function (err, secrets) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to fetch secrets information', err)
        );
      bag.secretsInitialized =
        secrets && secrets.isInstalled && secrets.isInitialized;
      return next();
    }
  );
}

function _initializeSecrets(bag, next) {
  if (bag.secretsInitialized) return next();

  var who = bag.who + '|' + _initializeSecrets.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.initializeSecrets({},
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to initialize secrets provider', err)
        );

      // temporary timeout until this route is retired
      logger.debug('Waiting 30 seconds for vault to boot');
      setTimeout(next, 30000);
    }
  );
}

function _getMsg(bag, next) {
  var who = bag.who + '|' + _getMsg.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getMsg(
    function (err, msg) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to get message information', err)
        );

      bag.msgInitialized = msg && msg.isInstalled && msg.isInitialized;

      return next();
    }
  );
}

function _postMsg(bag, next) {
  if (bag.msgInitialized) return next();

  var who = bag.who + '|' + _postMsg.name;
  logger.verbose(who, 'Inside');

  var postObj = {
    password: bag.reqBody.msgPassword
  };

  bag.apiAdapter.postMsg(postObj,
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to initialize messaging provider', err)
        );

      return next();
    }
  );
}

function _initializeMsg(bag, next) {
  if (bag.msgInitialized) return next();

  var who = bag.who + '|' + _initializeMsg.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.initializeMsg({},
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to initialize messaging provider', err)
        );

      // temporary timeout until this route is retired
      logger.debug('Waiting 30 seconds for RabbitMQ to boot');
      setTimeout(next, 30000);
    }
  );
}

function _getState(bag, next) {
  var who = bag.who + '|' + _getState.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getState(
    function (err, state) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to get state information', err)
        );

      bag.stateInitialized = state && state.isInstalled && state.isInitialized;

      return next();
    }
  );
}

function _initializeState(bag, next) {
  if (bag.stateInitialized) return next();

  var who = bag.who + '|' + _initializeState.name;
  logger.verbose(who, 'Inside');

  var postObj = {
    password: bag.reqBody.statePassword
  };

  bag.apiAdapter.postState(postObj,
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to initialize state provider', err)
        );

      return next();
    }
  );
}

function _getRedis(bag, next) {
  var who = bag.who + '|' + _getRedis.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getRedis(
    function (err, redis) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to get Redis information', err)
        );

      bag.redisInitialized = redis && redis.isInstalled && redis.isInitialized;

      return next();
    }
  );
}

function _initializeRedis(bag, next) {
  if (bag.redisInitialized) return next();

  var who = bag.who + '|' + _initializeRedis.name;
  logger.verbose(who, 'Inside');

  var postObj = {};

  bag.apiAdapter.initializeRedis(postObj,
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed,
            'Failed to initialize Redis', err)
        );

      // temporary timeout until this route is retired
      logger.debug('Waiting 10 seconds for Redis to boot');
      setTimeout(next, 10000);
    }
  );
}
