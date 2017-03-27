'use strict';

var self = post;
module.exports = self;

var async = require('async');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('auth|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _post.bind(null, bag)
  ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return respondWithError(res, err);

      res.cookie('loginToken', bag.reqBody.loginToken);
      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  if (!bag.reqBody.loginToken ||
    bag.reqBody.loginToken !== global.config.loginToken)
    return next(
      new ActErr(who, ActErr.Unauthorized, 'Unauthorized')
    );

  return next();
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  bag.resBody = {};

  return next();
}
