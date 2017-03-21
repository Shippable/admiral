'use strict';

var self = ActErr;
global.ActErr = self;

//The idea here is we classify all errors that occur in our system to
//below categories and decide the log level based on them, irrespective
//of what error we send back to the caller. This will reduce the noise that
//occurs in our logs so that we can be more actionable

//Shippable devil series - 666
ActErr.InternalServer = 666;

//Shippable errors - 1000 series
ActErr.DBOperationFailed = 1001;
ActErr.ProviderUnavailable = 1002;
ActErr.BraintreeError = 1003;
ActErr.EnqueueFailed = 1004;
ActErr.ShippableAdapter500 = 1005;

//Shippable warnings - 2000 series
ActErr.Unauthorized = 2000;
ActErr.CallerAccountNotFound = 2001;
ActErr.NoValidOwner = 2002;
ActErr.InvalidToken = 2003;
ActErr.ShippableAdapter300 = 2004;
ActErr.ShippableAdapter400 = 2005;

//Shippable info - 3000 series
ActErr.ProviderTokenInvalid = 3001;

//Shippable verbose - 4000 series
ActErr.DBEntityNotFound = 4001;
ActErr.ParamNotFound = 4002;
ActErr.InvalidParam = 4003;
ActErr.DataNotFound = 4004; // This needs to be changed to InvalidData
ActErr.OperationFailed = 4005;
ActErr.ApiServerError = 4006;
ActErr.PlanLimitation = 4007;
ActErr.DependencyCheckFailed = 4008;
ActErr.WebhookNotSupported = 4009;
ActErr.BodyNotFound = 4010;
ActErr.DBDuplicateKeyError = 4011;
ActErr.ObjectAlreadyExists = 4012;
ActErr.ShippableYaml = 4013;
ActErr.BuildMinutesExceeded = 4015;
ActErr.ProviderRateLimit = 4017;

function ActErr(methodName, id, message, error) {
  //handle logType
  if (id >= 1000 && id < 2000)
    this.logType = 'error';
  else if (id >= 2000 && id < 3000)
    this.logType = 'warn';
  else if (id >= 3000 && id < 4000)
    this.logType = 'info';
  else if (id >= 4000 && id < 5000)
    this.logType = 'verbose';
  else {
    id = 666;
    this.logType = 'error';
  }

  this.methodName = methodName || 'unknown method';
  this.id = id;
  this.message = message || 'unknown error';
  if (error) {
    this.link = error;
  }
}
