'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {
      ipAddress: '',
      dbPort: '',
      dbName: '',
      dbUser: '',
      dbPassword: ''
    },
    component: 'db'
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _get.bind(null, bag),
    _getSettings.bind(null, bag)
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


  bag.resBody = {
    ipAddress: process.env.DBHOST || '',
    dbPort: process.env.DBPORT || '',
    dbName: process.env.DBNAME || '',
    dbUser: process.env.DBUSERNAME || '',
    dbPassword: process.env.DBPASSWORD || ''
  };

  return next();
}

function _getSettings(bag, next) {
  var who = bag.who + '|' + _getSettings.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, db) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(db))
        logger.debug('No db settings present');
      else
        bag.resBody = _.extend(bag.resBody, db);

      return next();
    }
  );
}
