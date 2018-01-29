'use strict';

var self = validateBaseUrl;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var GithubAdapter = require('../publicAdapter.js');

function validateBaseUrl(url, providerName, callback) {
  var bag = {
    url: url,
    providerName: providerName
  };

  bag.who = util.format('common|github|validators|%s', self.name);
  logger.verbose(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _createAdapter.bind(null, bag),
      _verifyBaseUrl.bind(null, bag),
    ],
    function (err) {
      logger.verbose(bag.who, 'Completed');
      if (err)
        return callback(err);

      return callback(null);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.debug(who, 'Inside');

  if (!bag.url)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Route parameter not found :url')
    );

  if (!bag.url.endsWith('api/v3') && !bag.url.endsWith('api/v3/'))
    return next(
      new ActErr(who, ActErr.InvalidParam, 'Invalid parameter :url')
    );

  bag.url = bag.url.split('/api/v3')[0];
  return next();
}

function _createAdapter(bag, next) {
  var who = bag.who + '|' + _createAdapter.name;
  logger.debug(who, 'Inside');

  bag.githubAdapter = new GithubAdapter(bag.url, bag.providerName);

  return next();
}

function _verifyBaseUrl(bag, next) {
  var who = bag.who + '|' + _verifyBaseUrl.name;
  logger.debug(who, 'Inside');

  bag.githubAdapter.verifyUrl(
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Invalid url', err)
        );

      return next();
    }
  );
}
