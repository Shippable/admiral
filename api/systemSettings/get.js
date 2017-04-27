'use strict';

var self = get;
module.exports = self;

var async = require('async');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {}
  };

  bag.who = util.format('systemSettings|%s', self.name);
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

  global.config.client.query('SELECT * from "systemSettings"',
    function (err, systemSettings) {
      if (err) {
        if (err.code === '42P01') {
          logger.debug('SystemSettings table not created. Please initialize.');
          return next();
        }
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemSettings with error: ' + util.inspect(err))
        );
      }

      if (!systemSettings.rows || !systemSettings.rows[0])
        return next(
          new ActErr(who, ActErr.DataNotFound, 'System settings not found')
        );

      bag.resBody = systemSettings.rows[0];

      return next();
    }
  );
}
