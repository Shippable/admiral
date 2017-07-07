'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {}
  };

  bag.who = util.format('systemCodes|%s', self.name);
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

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  global.config.client.query('SELECT * from "systemCodes"',
    function (err, systemCodes) {
      if (err) {
        if (err.code === '42P01') {
          logger.debug('systemCodes table not created. Please initialize.');
          return next();
        }
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemCodes with error: ' + util.inspect(err))
        );
      }

      if (_.isEmpty(systemCodes.rows))
        return next(
          new ActErr(who, ActErr.DataNotFound, 'System codes not found')
        );

      bag.resBody = systemCodes.rows;

      return next();
    }
  );
}
