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
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    msgInitialized: false
  };

  bag.who = util.format('workflow|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _initializeDatabase.bind(null, bag),
      _getMsg.bind(null, bag),
      _initializeMsg.bind(null, bag)
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

  if (!_.has(bag.reqBody, 'msgPassword') ||
    _.isEmpty(bag.reqBody.msgPassword))
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data: msgPassword')
    );

  return next();
}

function _initializeDatabase(bag, next) {
  var who = bag.who + '|' + _initializeDatabase.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.postDB({},
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed, err)
        );

      return next();
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
          new ActErr(who, err.id || ActErr.OperationFailed, err)
        );

      bag.msgInitialized = msg && msg.isInstalled && msg.isInitialized;

      return next();
    }
  );
}

function _initializeMsg(bag, next) {
  if (bag.msgInitialized) return next();

  var who = bag.who + '|' + _initializeMsg.name;
  logger.verbose(who, 'Inside');

  var postObj = {
    password: bag.reqBody.msgPassword
  };

  bag.apiAdapter.postMsg(postObj,
    function (err) {
      if (err)
        return next(
          new ActErr(who, err.id || ActErr.OperationFailed, err)
        );

      return next();
    }
  );
}
