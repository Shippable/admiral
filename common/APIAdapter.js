'use strict';

var self = APIAdapter;
module.exports = self;

var async = require('async');
var request = require('request');

function APIAdapter(token) {
  logger.debug('Initializing', self.name);
  this.token = token;
  this.baseUrl = 'http://' + config.admiralIP + ':' + config.admiralPort;
  this.headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': 'apiToken ' + this.token
  };
}

/*****************************************/
/*                ROUTES                 */
/*****************************************/
/* Sorted alphabetically by folder name. */
/*****************************************/

// Admiral Env
APIAdapter.prototype.getAdmiralEnv =
  function (callback) {
    var url = '/api/admiral';
    this.get(url, callback);
  };

// db
APIAdapter.prototype.postDB =
  function (body, callback) {
    var url = '/api/db';
    this.post(url, body, callback);
  };

// masterIntegrationFields
APIAdapter.prototype.getMasterIntegrationFields =
  function (query, callback) {
    var url = '/api/masterIntegrationFields?' + query;
    this.get(url, callback);
  };

// masterIntegrations
APIAdapter.prototype.putMasterIntegrationById =
  function (masterIntegrationId, json, callback) {
    var url = util.format('/api/masterIntegrations/%s', masterIntegrationId);
    this.put(url, json, callback);
  };

APIAdapter.prototype.getMasterIntegrations =
  function (query, callback) {
    var url = util.format('/api/masterIntegrations?%s', query);
    this.get(url, callback);
  };

// msg
APIAdapter.prototype.getMsg =
  function (callback) {
    var url = '/api/msg';
    this.get(url, callback);
  };

APIAdapter.prototype.getMsgStatus =
  function (callback) {
    var url = '/api/msg/status';
    this.get(url, callback);
  };

APIAdapter.prototype.postMsg =
  function (body, callback) {
    var url = '/api/msg';
    this.post(url, body, callback);
  };

APIAdapter.prototype.initializeMsg =
  function (body, callback) {
    var url = '/api/msg/initialize';
    this.post(url, body, callback);
  };

// providers
APIAdapter.prototype.getProviders =
  function (query, callback) {
    var url = '/api/providers?' + query;
    this.get(url, callback);
  };

APIAdapter.prototype.postProvider =
  function (body, callback) {
    var url = '/api/providers';
    this.post(url, body, callback);
  };

// redis
APIAdapter.prototype.getRedis =
  function (callback) {
    var url = '/api/redis';
    this.get(url, callback);
  };

APIAdapter.prototype.postRedis =
  function (body, callback) {
    var url = '/api/redis';
    this.post(url, body, callback);
  };
APIAdapter.prototype.initializeRedis =
  function (body, callback) {
    var url = '/api/redis/initialize';
    this.post(url, body, callback);
  };

// secrets
APIAdapter.prototype.getSecrets =
  function (callback) {
    var url = '/api/secrets';
    this.get(url, callback);
  };

APIAdapter.prototype.postSecrets =
  function (body, callback) {
    var url = '/api/secrets';
    this.post(url, body, callback);
  };

APIAdapter.prototype.initializeSecrets =
  function (body, callback) {
    var url = '/api/secrets/initialize';
    this.post(url, body, callback);
  };

// state
APIAdapter.prototype.getState =
  function (callback) {
    var url = '/api/state';
    this.get(url, callback);
  };

APIAdapter.prototype.getStateStatus =
  function (callback) {
    var url = '/api/state/status';
    this.get(url, callback);
  };

APIAdapter.prototype.postState =
  function (body, callback) {
    var url = '/api/state';
    this.post(url, body, callback);
  };

APIAdapter.prototype.initializeState =
  function (body, callback) {
    var url = '/api/state/initialize';
    this.post(url, body, callback);
  };

// systemIntegrations
APIAdapter.prototype.getSystemIntegrations =
  function (query, callback) {
    var url = '/api/systemIntegrations?' + query;
    this.get(url, callback);
  };

APIAdapter.prototype.putSystemIntegration =
  function (systemIntegrationId, body, callback) {
    var url = '/api/systemIntegrations/' + systemIntegrationId;
    this.put(url, body, callback);
  };

APIAdapter.prototype.postSystemIntegration =
  function (body, callback) {
    var url = '/api/systemIntegrations';
    this.post(url, body, callback);
  };

// services
APIAdapter.prototype.postServices =
  function (body, callback) {
    var url = '/api/services';
    this.post(url, body, callback);
  };

APIAdapter.prototype.getServices =
  function (query, callback) {
    var url = '/api/services?' + query;
    this.get(url, callback);
  };

APIAdapter.prototype.deleteServices =
  function (name, callback) {
    var url = '/api/services/' + name;
    this.delete(url, callback);
  };

// systemSettings
APIAdapter.prototype.getSystemSettings =
  function (query, callback) {
    var url = '/api/systemSettings?' + query;
    this.get(url, callback);
  };

/*****************************************/
/*              HTTP METHODS             */
/*****************************************/
/*          GET PUT POST DELETE          */
/*****************************************/

APIAdapter.prototype.get = function (relativeUrl, callback) {
  logger.debug('GET', relativeUrl);
  var opts = {
    method: 'GET',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : this.baseUrl + relativeUrl,
    headers: this.headers
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

APIAdapter.prototype.post = function (relativeUrl, json, callback) {
  logger.debug('POST', relativeUrl);
  var opts = {
    method: 'POST',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : this.baseUrl + relativeUrl,
    headers: this.headers,
    json: json
  };
  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

APIAdapter.prototype.put = function (relativeUrl, json, callback) {
  logger.debug('PUT', relativeUrl);
  var opts = {
    method: 'PUT',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : this.baseUrl + relativeUrl,
    headers: this.headers,
    json: json
  };
  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

APIAdapter.prototype.delete = function (relativeUrl, callback) {
  var opts = {
    method: 'DELETE',
    url: relativeUrl.indexOf('http') === 0 ?
      relativeUrl : this.baseUrl + relativeUrl,
    headers: this.headers
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

// common helper methods
function _performCall(bag, next) {
  var who = self.name + '|' + _performCall.name;
  logger.debug('Inside', who);

  bag.startedAt = Date.now();

  request(bag.opts,
    function (err, res, body) {
      var interval = Date.now() - bag.startedAt;
      logger.debug(bag.opts.method, bag.relativeUrl, 'took', interval,
        'ms and returned HTTP status', (res && res.statusCode));

      bag.res = res;
      bag.body = body;
      bag.statusCode = res && res.statusCode;
      if (res && res.statusCode > 299)
        err = err || res.statusCode;
      if (err) {
        logger.error('API returned status', err,
          'for request', bag.relativeUrl);
        bag.err = err;
      }
      return next();
    }
  );
}

function _parseResponse(bag, next) {
  /* jshint maxcomplexity:15 */
  var who = self.name + '|' + _parseResponse.name;
  logger.debug('Inside', who);

  if (bag.err) {
    // Return something with an ActErr error ID
    var newErr = {
      id: ActErr.ApiServerError,
      message: bag.opts.method + ' ' + bag.relativeUrl + ' returned ' + bag.err
    };
    if (299 < bag.err && bag.err < 400)
      newErr.id = ActErr.ShippableAdapter300;
    else if (399 < bag.err && bag.err < 500)
      newErr.id = ActErr.ShippableAdapter400;
    else if (499 < bag.err && bag.err < 600)
      newErr.id = ActErr.ShippableAdapter500;
    bag.err = newErr;
  }

  if (bag.body) {
    if (typeof bag.body === 'object') {
      bag.parsedBody = bag.body;
      if (bag.err && bag.parsedBody && bag.parsedBody.id)
        bag.err = bag.parsedBody;
    } else {
      try {
        bag.parsedBody = JSON.parse(bag.body);
        if (bag.err && bag.parsedBody && bag.parsedBody.id)
          bag.err = bag.parsedBody;
      } catch (e) {
        if (!bag.err)
          logger.error('Unable to parse bag.body', bag.body, e);
        bag.err = bag.err || {
          id: ActErr.OperationFailed,
          message: 'Could not parse response'
        };
      }
    }
  }

  if (bag.err)
    bag.err.statusCode = bag.statusCode;

  return next();
}
