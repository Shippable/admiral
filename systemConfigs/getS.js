'use strict';

var self = getS;
module.exports = self;

var async = require('async');

function getS(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: []
  };

  bag.who = util.format('systemConfigs|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getS.bind(null, bag)
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

//TODO: Update the function to return systemConfigs
function _getS(bag, next) {
  var who = bag.who + '|' + _getS.name;
  logger.verbose(who, 'Inside');

  return next();
}
