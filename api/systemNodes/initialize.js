'use strict';

var self = initialize;
module.exports = self;

var async = require('async');

function initialize(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag)
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

  if (!bag.reqBody.id)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :id')
    );
  bag.systemNodeId = bag.reqBody.id;

  return next();
}
