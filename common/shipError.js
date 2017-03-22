'use strict';

module.exports = shipError;
global.shipError = shipError;

var util = require('util');

function shipError(actError, logType) {
  if (!actError)
    actError = new ActErr(ActErr.InternalServer,
      ActErr.InternalServerMsg);

  // log the full stack to log file
  logError(actError, logType);
}

function logError(error, logType) {
  var err = error;
  if (typeof logType !== 'string')
    logType = 'error';
  logType = logType || 'error';
  do {
    if (err.message)
      logger[logType](err.methodName, err.message);
    else
      logger[logType](util.inspect(err));
    if (err.stack) logger[logType](err.stack);
    err = err.link;
  } while (err);
}
