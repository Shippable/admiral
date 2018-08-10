'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');
var spawn = require('child_process').spawn;

function getStatus(req, res) {
  var bag = {
    reqQuery: req.query,
    containerName: 'admiral',
    resBody: {
      ip: '',
      port: '',
      uptime: '',
      isReachable: false,
      error: null
    }
  };

  bag.who = util.format('admiral|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _getAdmiralUptime.bind(null, bag),
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

function _getAdmiralUptime(bag, next) {
  var who = bag.who + '|' + _getAdmiralUptime.name;
  logger.verbose(who, 'Inside');
  var admiralStatusCmd = util.format('docker ps ' +
    ' --filter name=%s ' +
    ' --format "{{.Status}}"', bag.containerName);

  var exec = spawn('/bin/bash',
    ['-c', admiralStatusCmd]
  );

  exec.stdout.on('data',
    function (data)  {
      bag.resBody.uptime = data.toString();
      logger.debug(who, bag.resBody.uptime);
    }
  );

  exec.stderr.on('data',
    function (data)  {
      bag.resBody.error = data.toString();
      logger.error(who, bag.resBody.error);
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

function _getStatus(bag, next) {
  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  bag.resBody.ip = global.config.admiralIP;
  bag.resBody.port = global.config.admiralPort;
  // if we've reached this far, admiral container is reachable
  bag.resBody.isReachable = true;

  return next();
}
