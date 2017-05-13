'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var configHandler = require('../../common/configHandler.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    component: 'master'
  };

  bag.who = util.format('master|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
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

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, master) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(master))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );

      bag.config = master;
      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var update = {};

  if (_.has(bag.reqBody, 'address'))
    update.address = bag.reqBody.address;
  if (_.has(bag.reqBody, 'port'))
    update.port = bag.reqBody.port;

  configHandler.put(bag.component, update,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      bag.resBody = response;
      return next();
    }
  );
}
