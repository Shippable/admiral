'use strict';

var self = validateBaseUrl;
module.exports = self;

var async = require('async');
var BBSAdapter = require('../publicAdapter.js');

function validateBaseUrl(url, providerName, callback) {
  var bag = {
    url: url,
    providerName: providerName
  };

  bag.who = util.format('common|bitbucketServer|validators|%s', self.name);
  logger.verbose(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _createAdapter.bind(null, bag),
      _getRepos.bind(null, bag),
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

  return next();
}

function _createAdapter(bag, next) {
  var who = bag.who + '|' + _createAdapter.name;
  logger.debug(who, 'Inside');

  bag.bitbucketServerAdapter = new BBSAdapter(bag.url, bag.providerName);

  return next();
}

function _getRepos(bag, next) {
  var who = bag.who + '|' + _getRepos.name;
  logger.debug(who, 'Inside');

  bag.bitbucketServerAdapter.getBBSRepos(
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Unable to getRepos', err)
        );
      return next();
    }
  );
}
