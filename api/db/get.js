'use strict';

var self = get;
module.exports = self;

var async = require('async');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {
      ipAddress: '',
      dbPort: '',
      dbName: '',
      dbUser: '',
      dbPassword: ''
    }
  };

  bag.who = util.format('db|%s', self.name);
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


  bag.resBody = {
    ipAddress: process.env.DBHOST || '',
    dbPort: process.env.DBPORT || '',
    dbName: process.env.DBNAME || '',
    dbUser: process.env.DBUSERNAME || '',
    dbPassword: process.env.DBPASSWORD || ''
  };

  return next();
}
