'use strict';

var self = getLogs;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var fs = require('fs');
var readline = require('readline');
var path = require('path');

function getLogs(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    component: 'msg'
  };

  bag.who = util.format('msg|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
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

function _get(bag, next) {
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
            'Failed to get logs for ' + bag.component, err)
        );

      return next(null);
    }
  );
}
