'use strict';
var self = GitLabAdapter;
module.exports = self;

var async = require('async');
var request = require('request');

function GitLabAdapter(token, baseUrl, username, password) {
  this.username = username;
  this.password = password;
  this.token = token;
  this.baseUrl = baseUrl;

  logger.debug(
    util.format('Inside common|GitLabAdapter: Using url %s', this.baseUrl)
  );
}

//initialize the adapter to get a token
GitLabAdapter.prototype.initialize = function (callback) {
  if (this.token)
    return callback();

  if (!this.username || !this.password)
    return callback();

  var self = this;
  this.postSession(
    function (err, body) {
      if (body)
        /* jshint camelcase:false */
        self.token = body.private_token;
        /* jshint camelcase:true */

      return callback(err, body);
    }
  );
};


// Session
GitLabAdapter.prototype.postSession = function (callback) {
  var url = '/session?login=' + this.username + '&password=' + this.password;
  this.post(url, {}, callback);
};

// Users
GitLabAdapter.prototype.getCurrentUser = function (callback) {
  var url = '/user';
  this.get(url, callback);
};

// HTTP methods
GitLabAdapter.prototype.get = function (relativeUrl, callback) {
  var opts = {
    method: 'GET',
    url: relativeUrl.indexOf('http') === 0 ? relativeUrl : this.baseUrl +
      relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer ' + this.token,
      'PRIVATE-TOKEN': this.token,
      'User-Agent': 'Shippable API',
      'Accept': 'application/json'
    }
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    token: this.token
  };

  bag.who = util.format('common|%s|GET|url:%s', self.name, relativeUrl);
  logger.debug('Starting', bag.who);

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      logger.debug('Completed', bag.who);
      return callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

GitLabAdapter.prototype.post = function (relativeUrl, json, callback) {
  var opts = {
    method: 'POST',
    url: this.baseUrl + relativeUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': 'Bearer ' + this.token,
      'PRIVATE-TOKEN': this.token,
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

  bag.who = util.format('common|%s|POST|url:%s', self.name,
    relativeUrl);
  logger.debug('Starting', bag.who);

  async.series([
      _performCall.bind(null, bag),
      _parseResponse.bind(null, bag)
    ],
    function () {
      logger.debug('Completed', bag.who);
      return callback(bag.err, bag.parsedBody, bag.res);
    }
  );
};

// Common helper methods
function _performCall(bag, next) {
  var who = bag.who + '|' + _performCall.name;
  logger.debug('Inside', who);

  bag.startedAt = Date.now();
  request(bag.opts,
    function (err, res, body) {
      var interval = Date.now() - bag.startedAt;
      logger.debug('GitLab request ' + bag.opts.method + ' ' +
        bag.opts.url + ' took ' + interval +
        ' ms and returned HTTP status ' + (res && res.statusCode));

      bag.res = res;
      bag.body = body;
      if (res && res.statusCode > 299)
        err = err || res.statusCode;
      if (err) {
        logger.debug('GitLab returned status', err, 'for request', bag.who);
        bag.err = err;
      }
      return next();
    }
  );
}

function _parseResponse(bag, next) {
  var who = bag.who + '|' + _parseResponse.name;
  logger.debug('Inside', who);

  if (bag.body) {
    if (typeof bag.body === 'object') {
      bag.parsedBody = bag.body;
    } else {
      try {
        bag.parsedBody = JSON.parse(bag.body);
      } catch (e) {
        logger.debug('Unable to parse bag.body', bag.body, e);
        bag.err = e;
      }
    }
  }
  return next();
}
