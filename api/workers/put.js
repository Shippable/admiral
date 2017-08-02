'use strict';

var self = put;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');

function put(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    res: res,
    component: 'workers'
  };

  bag.who = util.format('workers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _put.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        respondWithError(bag.res, err);

      sendJSONResponse(bag.res, bag.resBody);
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

  if (!_.has(bag.reqBody, 'name'))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data :name')
    );

  bag.workerName = bag.reqBody.name;

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, workers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(workers))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );

      bag.config = workers;
      return next();
    }
  );
}

function _put(bag, next) {
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  var existingWorker = _.findWhere(bag.config, {name: bag.workerName});
  if (!existingWorker)
    return next(
      new ActErr(who, ActErr.OperationFailed,
        'Worker name ' + bag.workerName + ' not found.')
    );

  if (_.has(bag.reqBody, 'address'))
    existingWorker.address = bag.reqBody.address;

  if (_.has(bag.reqBody, 'port'))
    existingWorker.port = bag.reqBody.port;

  if (_.has(bag.reqBody, 'isProcessing'))
    existingWorker.isProcessing = bag.reqBody.isProcessing;

  if (_.has(bag.reqBody, 'isFailed'))
    existingWorker.isFailed = bag.reqBody.isFailed;

  if (_.has(bag.reqBody, 'isInstalled'))
    existingWorker.isInstalled = bag.reqBody.isInstalled;

  if (_.has(bag.reqBody, 'isInitialized'))
    existingWorker.isInitialized = bag.reqBody.isInitialized;

  _.each(bag.config,
    function (worker) {
      if (worker.name === bag.workerName) {
        _.extend(worker, existingWorker);
      }
    }
  );

  configHandler.put(bag.component, bag.config,
    function (err, config) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update db config', err)
        );

      bag.resBody = config;
      return next();
    }
  );
}
