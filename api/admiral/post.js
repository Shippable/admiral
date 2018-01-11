'use strict';

var self = post;
module.exports = self;

var async = require('async');
var fs = require('fs');

var envHandler = require('../../common/envHandler.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('admiral|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _checkFileExists.bind(null, bag),
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

  return next();
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

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  async.eachOfSeries(bag.reqBody,
    function (value, key, done) {
      envHandler.post(key, value,
        function (err) {
          if (err)
            return done(
              new ActErr(who, ActErr.OperationFailed,
                'Failed to set ' + key + ' with error: ' + err)
            );

          return done();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}
