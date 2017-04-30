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
    resBody: {},
    versionFile: '/home/shippable/admiral/version.txt'
  };

  bag.who = util.format('versions|%s', self.name);
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

  fs.stat(bag.versionFile,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get ' + bag.versionFile +
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
    input: fs.createReadStream(bag.versionFile),
    console: false
  });

  filereader.on('line',
    function (envLine) {
      if (!_.isEmpty(envLine))
        bag.resBody.version = envLine;
    }
  );

  filereader.on('close',
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
          'Failed to read ' + bag.versionFile +
          ' with error ' + util.inspect(err))
        );

      return next();
    }
  );
}
