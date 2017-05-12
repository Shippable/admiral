'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: []
  };

  bag.who = util.format('superUsers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _getSuperUserRoleCode.bind(null, bag),
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

function _getSuperUserRoleCode(bag, next) {
  var who = bag.who + '|' + _getSuperUserRoleCode.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "code" FROM "systemCodes" WHERE '+
    '"group"=\'roles\' AND "name"=\'superUser\'';

  global.config.client.query(query,
    function (err, result) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to fetch superUser roleCode', err)
        );

      if (_.isEmpty(result.rows) || !result.rows[0].code)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No code found for group: roles and name: superUser')
        );
      bag.superUserRoleCode = result.rows[0].code;
      logger.debug('superUser role code is: ' + bag.superUserRoleCode);
      return next();
    }
  );
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT "accountId" FROM "accountRoles" ' +
    'WHERE "roleCode"=\'%s\'', bag.superUserRoleCode);

  global.config.client.query(query,
    function (err, results) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get superUsers', err)
        );
      if (!_.isEmpty(results.rows))
        bag.resBody = _.pluck(results.rows, 'accountId');

      logger.debug(util.format('successfully fetched %s superUsers',
        bag.resBody.length));

      return next();
    }
  );
}
