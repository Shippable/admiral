'use strict';

var self = get;
module.exports = self;

function get(req, res) {
  var bag = {
    resBody: []
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  sendJSONResponse(res, bag.resBody);
}
