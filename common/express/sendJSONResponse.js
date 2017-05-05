'use strict';
var self = sendJSONResponse;
module.exports = self;
global.sendJSONResponse = self;

function sendJSONResponse(res, obj, statusCode) {
  var responseCode = statusCode || 200;
  return res.status(responseCode).json(obj);
}
