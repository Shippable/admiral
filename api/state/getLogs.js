'use strict';

var self = getLogs;
module.exports = self;

var async = require('async');
var fs = require('fs');
var readline = require('readline');
var path = require('path');

function getLogs(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    component: 'state',
    skipRead: false
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _checkFile.bind(null, bag),
    _get.bind(null, bag)
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

  bag.logsFile = path.join(
    global.config.runtimeDir, '/logs/', bag.component + '.log');

  return next();
}

function _checkFile(bag, next) {
  var who = bag.who + '|' + _checkFile.name;
  logger.verbose(who, 'Inside');

  fs.stat(bag.logsFile,
    function (err) {
      if (err && err.code === 'ENOENT')
        bag.skipRead = true;
      else if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get logs for ' + bag.component + ' with error: ' + err)
        );

      return next();
    }
  );
}

function _get(bag, next) {
  if (bag.skipRead) return next();

  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  var filereader = readline.createInterface({
    input: fs.createReadStream(bag.logsFile),
    console: false
  });

  filereader.on('line',
    function (line) {
      bag.resBody.push(line);
    }
  );

  filereader.on('close',
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get logs for ' + bag.component +
            ' with error: ' + util.inspect(err))
        );

      return next(null);
    }
  );
}
