'use strict';

var self = initialize;
module.exports = self;

function initialize(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  sendJSONResponse(res, bag.resBody);
}
