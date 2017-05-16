'use strict';

var self = postSuperUsers;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function postSuperUsers(req, res) {
  var bag = {
    reqQuery: req.query,
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('superUsers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _getSuperUserRoleCode.bind(null, bag),
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

  if (_.isEmpty(bag.reqBody) || !bag.reqBody.accountId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Missing parameter in request body: accountId')
    );

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

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var query = util.format('INSERT INTO  "accountRoles" ' +
    '("accountId", "roleCode", "createdAt", "updatedAt") ' +
    'values (\'%s\', \'%s\', \'%s\', \'%s\')',
    bag.reqBody.accountId, bag.superUserRoleCode,
    new Date().toISOString(), new Date().toISOString());

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to create superUser from accountId: ' +
            bag.reqBody.accountId, err
          )
        );
      logger.debug('successfully added superUser for accountId: ' +
        bag.reqBody.accountId);

      bag.resBody.accountId = bag.reqBody.accountId;

      return next();
    }
  );
}
