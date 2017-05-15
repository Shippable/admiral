'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    component: 'workers'
  };

  bag.who = util.format('workers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _updateWorker.bind(null, bag),
      _post.bind(null, bag)
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

  if (!_.has(bag.reqBody, 'address') || _.isEmpty(bag.reqBody.address))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data :address')
    );

  bag.workerAddress = bag.reqBody.address;

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

      if (!_.isArray(workers))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );

      bag.config = workers;
      return next();
    }
  );
}

function _updateWorker(bag, next) {
  var who = bag.who + '|' + _updateWorker.name;
  logger.verbose(who, 'Inside');

  var newWorker = {
    address: bag.workerAddress,
    name: bag.workerName,
    port: 2377
  };

  var nameInUse = _.findWhere(bag.config, {name: bag.workerName});
  if (nameInUse && (nameInUse.address !== bag.workerAddress))
    return next(
      new ActErr(who, ActErr.OperationFailed,
        'Worker name ' + bag.workerName + ' is already in use.')
    );

  var workerExists = false;
  _.each(bag.config,
    function (worker) {
      if (worker.address === bag.workerAddress) {
        workerExists = true;
        _.extend(worker, newWorker);
      }
    }
  );

  if (!workerExists) {
    newWorker.isInitialized = false;
    newWorker.isInstalled = false;
    bag.config.push(newWorker);
  }

  return next();
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  configHandler.put(bag.component, bag.config,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      bag.resBody = response;
      return next();
    }
  );
}
