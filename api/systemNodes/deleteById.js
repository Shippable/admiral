'use strict';

var self = deleteById;
module.exports = self;

function deleteById(req, res) {
  var bag = {
    resBody: {}
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  sendJSONResponse(res, bag.resBody);
}
