'use strict';

var self = initialize;
module.exports = self;

var async = require('async');

var APIAdapter = require('../../common/APIAdapter.js');

function initialize(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1])
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemSettings.bind(null, bag)
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

  if (global.config.admiralIP !== 'localhost' &&
    global.config.admiralIP !== '127.0.0.1')
    return next(
      new ActErr(who, ActErr.OperationFailed, 'Unable to bring up system node')
    );

  return next();
}

function _getSystemSettings(bag, next) {
  var who = bag.who + '|' + _getSystemSettings.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemSettings('',
    function (err, systemSettings) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system settings : ' + util.inspect(err))
        );

      if (systemSettings.runMode !== 'dev')
        return next(
          new ActErr(who, ActErr.OperationFailed, util.format('Unable to ' +
            'POST system node on run mode: %s', systemSettings.runMode))
        );

      return next();
    }
  );
}
