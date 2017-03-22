'use strict';
var self = validateAccount;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function validateAccount(req, res, next) {
  var bag = {
    req: req,
    reqQuery: req.query || {},
    inputParams: req.params || {},
    reqPath: req.route.path,
    reqMethod: req.method.toUpperCase(),
    apiToken: null
  };

  bag.who = util.format('%s|%s|%s', bag.reqPath, bag.reqMethod, self.name);
  logger.verbose(bag.who, 'Started');

  async.series([
      _checkInputParams.bind(null, bag),
      _extractAPIToken.bind(null, bag),
      _validateLoginToken.bind(null, bag)
    ],
    function (err) {
      logger.verbose(bag.who, 'Completed');
      if (err)
        return respondWithError(res, err);

      return next();
    }
  );
}

function _checkInputParams(bag, next) {
  var who = util.format('%s|%s', bag.who, _checkInputParams.name);
  logger.debug(who, 'Inside');

  if (!bag.req)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing request object')
    );

  if (!bag.reqMethod)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing param data :reqMethod')
    );

  if (!bag.reqPath)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing param data :reqPath')
    );

  var invalidKey = _.findKey(bag.reqQuery,
    function (value) { return _.isArray(value); }
  );

  if (invalidKey)
    return next(
      new ActErr(who, ActErr.ShippableAdapter400,
        util.format('Multiple query params for :%s , ' +
          'please provide comma separated values', invalidKey)
      )
    );

  return next();
}

function _extractAPIToken(bag, next) {
  var who = util.format('%s|%s', bag.who, _extractAPIToken.name);
  logger.debug(who, 'Inside');

  if (bag.req.headers.authorization &&
    bag.req.headers.authorization.indexOf('apiToken') === 0) {
    var token = bag.req.headers.authorization.split(' ')[1];
    if (token && token.length === 0) return next();
    bag.apiToken = token;
    logger.debug(who, 'Found apiToken in Header');
    return next();
  }
  logger.debug(who, 'Failed to find apiToken in Header');
  return next();
}

function _validateLoginToken(bag, next) {
  var who = util.format('%s|%s', bag.who, _validateLoginToken.name);
  logger.debug(who, 'Inside');

  if (!bag.apiToken || bag.apiToken !== global.config.loginToken)
    return next(
      new ActErr(who, ActErr.Unauthorized, 'access denied to route: ' +
        bag.reqPath)
    );

  return next();
}

