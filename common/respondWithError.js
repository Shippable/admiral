'use strict';

var self = respondWithError;
global.respondWithError = self;

respondWithError.httpStatusMap = {};
respondWithError.httpStatusMap[ActErr.InternalServer] = 500;
respondWithError.httpStatusMap[ActErr.DBOperationFailed] = 500;
respondWithError.httpStatusMap[ActErr.ProviderUnavailable] = 503;
respondWithError.httpStatusMap[ActErr.BraintreeError] = 503;
respondWithError.httpStatusMap[ActErr.EnqueueFailed] = 503;
respondWithError.httpStatusMap[ActErr.Unauthorized] = 401;
respondWithError.httpStatusMap[ActErr.CallerAccountNotFound] = 401;
respondWithError.httpStatusMap[ActErr.NoValidOwner] = 403;
respondWithError.httpStatusMap[ActErr.ProviderTokenInvalid] = 403;
respondWithError.httpStatusMap[ActErr.DBEntityNotFound] = 404;
respondWithError.httpStatusMap[ActErr.ParamNotFound] = 400;
respondWithError.httpStatusMap[ActErr.InvalidParam] = 404;
respondWithError.httpStatusMap[ActErr.DataNotFound] = 404;
respondWithError.httpStatusMap[ActErr.OperationFailed] = 400;
respondWithError.httpStatusMap[ActErr.ApiServerError] = 500;
respondWithError.httpStatusMap[ActErr.PlanLimitation] = 412;
respondWithError.httpStatusMap[ActErr.DependencyCheckFailed] = 400;
respondWithError.httpStatusMap[ActErr.WebhookNotSupported] = 400;
respondWithError.httpStatusMap[ActErr.BodyNotFound] = 400;
respondWithError.httpStatusMap[ActErr.DBDuplicateKeyError] = 409;
respondWithError.httpStatusMap[ActErr.ObjectAlreadyExists] = 409;
respondWithError.httpStatusMap[ActErr.ShippableYaml] = 400;
respondWithError.httpStatusMap[ActErr.BuildMinutesExceeded] = 412;
respondWithError.httpStatusMap[ActErr.ProviderRateLimit] = 503;

respondWithError.httpStatusMap[ActErr.ShippableAdapter300] = 300;
respondWithError.httpStatusMap[ActErr.ShippableAdapter400] = 400;
respondWithError.httpStatusMap[ActErr.ShippableAdapter500] = 500;

function respondWithError(res, err) {
  //log the full stack to log file
  //logger takes care depending on log level set
  __logActError(err);

  // Find the deepest linked ActError
  while (err.link && err.link.id)
    err = err.link;

  var statusCode = respondWithError.httpStatusMap[err.id];
  if (!statusCode) statusCode = 500;

  res.status(statusCode).json(err);
}

function __logActError(err) {
  var logType;
  do {
    // Use logType from the current error if it has one, or inherit from parent
    logType = err.logType || logType;
    if (!logType)
      logType = 'error';
    logger[logType](err.methodName, err.message);
    if (err.stack) logger[logType](err.stack);
    err = err.link;
  }
  while (err);
}
