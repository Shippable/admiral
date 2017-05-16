'use strict';

var self = deleteByName;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var spawn = require('child_process').spawn;

var configHandler = require('../../common/configHandler.js');

function deleteByName(req, res) {
  var bag = {
    reqBody: req.body,
    inputParams: req.params,
    resBody: {},
    component: 'workers'
  };

  bag.who = util.format('deleteByName|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _delete.bind(null, bag),
      _removeFromCluster.bind(null, bag)
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

  if (_.isEmpty(bag.inputParams.name))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data :name')
    );

  bag.workerName = bag.inputParams.name;

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

      bag.workers = workers;
      return next();
    }
  );
}

function _delete(bag, next) {
  var who = bag.who + '|' + _delete.name;
  logger.verbose(who, 'Inside');

  bag.workers = _.without(bag.workers,
    _.findWhere(bag.workers, {name: bag.workerName}));

  configHandler.put(bag.component, bag.workers,
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

function _removeFromCluster(bag, next) {
  var who = bag.who + '|' + _removeFromCluster.name;
  logger.verbose(who, 'Inside');
  var removeCommand = util.format('sudo docker node rm -f %s || true',
    bag.workerName);

  var exec = spawn('/bin/bash',
    ['-c', removeCommand]
  );

  exec.stdout.on('data',
    function (data)  {
      logger.debug(who, data.toString());
    }
  );

  exec.stderr.on('data',
    function (data)  {
      logger.error(who, data.toString());
    }
  );

  exec.on('close',
    function (exitCode)  {
      if (exitCode > 0)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Script returned code: ' + exitCode)
        );
      return next();
    }
  );
}
