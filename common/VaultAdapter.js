'use strict';
var self = VaultAdapter;
module.exports = self;

var async = require('async');
var request = require('request');

function VaultAdapter(baseUrl, token) {
  this.token = token;
  this.baseUrl = baseUrl;
  if (!baseUrl)
    logger.warn('Vault API URL is required');
}

VaultAdapter.prototype.get = function (relativeUrl, callback) {
  var opts = {
    method: 'GET',
    url: this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Vault-Token': this.token,
      'User-Agent': 'Shippable API',
      'Accept': 'application/json'
    }
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|vault|%s|GET|url:%s', self.name, relativeUrl);
  logger.debug(bag.who, 'Starting');

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    logger.debug(bag.who, 'Completed');
    return callback(bag.err, bag.parsedBody, bag.headerLinks, bag.res);
  });
};

VaultAdapter.prototype.post = function (relativeUrl, json, callback) {
  var opts = {
    method: 'POST',
    url: this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Vault-Token': this.token,
      'User-Agent': 'Shippable API',
      'Accept': 'application/json'
    },
    json: json
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|vault|%s|POST|url:%s', self.name, relativeUrl);
  logger.debug(bag.who, 'Starting');

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    logger.debug(bag.who, 'Completed');
    callback(bag.err, bag.parsedBody, bag.headerLinks, bag.res);
  });
};

VaultAdapter.prototype.put = function (relativeUrl, json, callback) {
  var opts = {
    method: 'PUT',
    url: this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Vault-Token': this.token,
      'User-Agent': 'Shippable API',
      'Accept': 'application/json'
    },
    json: json
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|vault|%s|PUT|url:%s', self.name, relativeUrl);
  logger.debug(bag.who, 'Starting');

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    logger.debug(bag.who, 'Completed');
    callback(bag.err, bag.parsedBody, bag.headerLinks, bag.res);
  });
};

VaultAdapter.prototype.delete = function (relativeUrl, callback) {
  var opts = {
    method: 'DELETE',
    url: this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Vault-Token': this.token,
      'User-Agent': 'Shippable API',
      'Accept': 'application/json'
    }
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|vault|%s|DELETE|url:%s', self.name,
    relativeUrl);
  logger.debug(bag.who, 'Starting');

  async.series([
    _performCall.bind(null, bag),
    _parseResponse.bind(null, bag)
  ], function () {
    logger.debug(bag.who, 'Completed');
    callback(bag.err, bag.parsedBody, bag.res);
  });
};

// Debug
VaultAdapter.prototype.getHealth = function (callback) {
  this.get('/v1/sys/health', callback);
};

// Secrets
VaultAdapter.prototype.getSecret = function (key, callback) {
  var relativeUrl = util.format('/v1/%s', key);
  this.get(relativeUrl, callback);
};

VaultAdapter.prototype.getSecretsList = function (key, callback) {
  var relativeUrl = util.format('/v1/%s?list=true', key);
  this.get(relativeUrl, callback);
};

VaultAdapter.prototype.postSecret = function (key, secret, callback) {
  var relativeUrl = util.format('/v1/%s', key);
  this.post(relativeUrl, secret, callback);
};

VaultAdapter.prototype.deleteSecret = function (key, callback) {
  var relativeUrl = util.format('/v1/%s', key);
  this.delete(relativeUrl, callback);
};

// Policies
VaultAdapter.prototype.putPolicy = function (name, body, callback) {
  this.put('/v1/sys/policy/' + name, body, callback);
};

// Tokens
VaultAdapter.prototype.postToken = function (body, callback) {
  this.post('/v1/auth/token/create', body, callback);
};

//
// Helper methods
//
function _performCall(bag, next) {
  var who = bag.who + '|' + _parseResponse.name;
  logger.debug(who, 'Inside');

  bag.startedAt = Date.now();
  request(bag.opts,
    function (err, res, body) {
      var interval = Date.now() - bag.startedAt;

      logger.debug(
        util.format('Request %s %s took %s ms and returned HTTP status %s',
          bag.opts.method, bag.opts.url, interval, res && res.statusCode)
      );

      bag.res = res;
      bag.body = body;
      if (res && res.statusCode > 299)
        err = err || res.statusCode;
      if (err) {
        logger.debug(
          util.format('Vault returned status %s for request %s',
            err, bag.who)
        );
        bag.err = err;
      }

      return next();
    }
  );
}

function _parseResponse(bag, next) {
  var who = bag.who + '|' + _parseResponse.name;
  logger.debug(who, 'Inside');

  if (bag.body) {
    if (typeof bag.body === 'object') {
      bag.parsedBody = bag.body;
    } else {
      try {
        bag.parsedBody = JSON.parse(bag.body);
      } catch (e) {
        logger.debug('Unable to parse bag.body: ', bag.body, e);
        bag.err = e;
      }
    }
  }
  return next();
}
