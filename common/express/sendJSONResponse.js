'use strict';
var self = sendJSONResponse;
module.exports = self;
global.sendJSONResponse = self;

function sendJSONResponse(res, obj) {
  return res.status(200).json(obj);
}
