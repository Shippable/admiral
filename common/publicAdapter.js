'use strict';
var self = Adapter;
module.exports = self;

var async = require('async');
var request = require('request');

function Adapter(url, providerName) {
  if (url) {
    logger.debug(
      util.format('Inside common|publicAdapter: Using %s url', url)
    );
    this.baseUrl = url;
  } else {
    logger.warn('API endpoint URL is required.');
  }
  this.providerName = providerName;
}

Adapter.prototype.get = function (relativeUrl, options, callback) {
  var opts = {
    method: 'GET',
    url: relativeUrl.indexOf('http') === 0 ? relativeUrl : this.baseUrl +
      relativeUrl
  };

  var bag = {
    opts: opts,
    relativeUrl: relativeUrl,
    retry: options && options.retry,
    providerName: this.providerName
  };

  bag.who = util.format('common|%s|GET|url:%s', self.name, relativeUrl);
  logger.debug(bag.who, 'Starting');

  async.series([
    _performCall.bind(null, bag)
  ], function () {
    logger.debug(bag.who, 'Completed');
    return callback(bag.err, bag.parsedBody, bag.headerLinks, bag.res);
  });
};

// Common helper methods
function _performCall(bag, next) {
  var who = bag.who + '|' + _performCall.name;
  logger.debug(who, 'Inside');

  bag.startedAt = Date.now();
  var retryOpts = {
    times: bag.retry? 5 : 1,
    interval: function (retryCount) {
      return Math.pow(2, retryCount) * 1000;
    }
  };

  async.retry(retryOpts,
    function (callback) {
      request(bag.opts,
        function (err, res) {
          var interval = Date.now() - bag.startedAt;
          logger.debug(who, 'Shippable request ' + bag.opts.method + ' ' +
            bag.opts.url + ' took ' + interval +
            ' ms and returned HTTP status ' + (res && res.statusCode));

          if (res && res.statusCode > 299)
            err = err || res.statusCode;
          if (err)
            logger.debug(who, bag.providerName + 'returned an error', err);

          bag.err = err;
          bag.res = res;

          if (bag.res && bag.res.statusCode) {
            bag.parsedBody = bag.res.statusCode;
          }

          return callback(err);
        }
      );
    },
    function () {
      return next();
    }
  );
}

Adapter.prototype.getBBSRepos = function (callback) {
  var url = '/repos?visibility=public';
  this.get(url, {}, callback);
};

Adapter.prototype.getGitlabProjects = function (callback) {
  var url = '/projects';
  this.get(url, {}, callback);
};

Adapter.prototype.verifyUrl = function (callback) {
  var url = '/';
  this.get(url, {}, callback);
};
