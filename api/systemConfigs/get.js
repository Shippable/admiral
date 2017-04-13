'use strict';

var self = get;
module.exports = self;

var async = require('async');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {}
  };

  bag.who = util.format('systemConfigs|%s', self.name);
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

  global.config.client.query('SELECT * from "systemConfigs"',
    function (err, systemConfigs) {
      if (err) {
        if (err.code === '42P01') {
          logger.debug('SystemConfigs table not created. Please initialize.');
          return next();
        }
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );
      }

      if (!systemConfigs.rows || !systemConfigs.rows[0])
        return next(
          new ActErr(who, ActErr.DataNotFound, 'System configs not found')
        );

      bag.resBody = systemConfigs.rows[0];

      return next();
    }
  );
}
