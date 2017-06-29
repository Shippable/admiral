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
    eulaFilename: 'SHIPPABLE_SERVER_LICENSE_AGREEMENT',
    path: '',
    resBody: []
  };

  bag.who = util.format('eula|%s', self.name);
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

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _checkFileExists(bag, next) {
  var who = bag.who + '|' + _checkFileExists.name;
  logger.verbose(who, 'Inside');
  bag.path = global.config.baseDir + '/' + bag.eulaFilename;
  fs.stat(bag.path,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get ' + bag.eulaFilename +
            ' with error: ' + util.inspect(err))
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
    input: fs.createReadStream(bag.path),
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
            'Failed to get EULA from: ' + bag.path +
            ' with error: ' + util.inspect(err))
        );

      return next(null);
    }
  );
}
