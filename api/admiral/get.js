'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var fs = require('fs');
var readline = require('readline');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {}
  };

  bag.who = util.format('admiral|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _checkFileExists.bind(null, bag),
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

function _checkFileExists(bag, next) {
  var who = bag.who + '|' + _checkFileExists.name;
  logger.verbose(who, 'Inside');

  fs.stat(global.config.admiralEnv,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get ' + global.config.admiralEnv +
            ' with error: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  var filereader = readline.createInterface({
    input: fs.createReadStream(global.config.admiralEnv),
    console: false
  });

  filereader.on('line',
    function (envLine) {
      if (!_.isEmpty(envLine) && envLine.indexOf('=') >= 0) {
        var name = envLine.split('=')[0];
        // split the string only on first = for postgres password
        var value = envLine.split(/=(.+)/)[1];
        bag.resBody[name] = JSON.parse(value);
      }
    }
  );

  filereader.on('close',
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
          'Failed to read ' + global.config.admiralEnv +
          ' with error ' + util.inspect(err))
        );

      return next();
    }
  );
}
