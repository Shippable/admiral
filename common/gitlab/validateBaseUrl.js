'use strict';

var self = validateBaseUrl;
module.exports = self;

var async = require('async');
var GitlabAdapter = require('../publicAdapter.js');

function validateBaseUrl(url, providerName, callback) {
  var bag = {
    url: url,
    providerName: providerName,
    toValidate: true
  };

  bag.who = util.format('common|gitlab|validators|%s', self.name);
  logger.verbose(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _createAdapter.bind(null, bag),
      _getProjects.bind(null, bag),
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

  if (bag.url.endsWith('v3'))
    bag.toValidate = false;

  return next();
}

function _createAdapter(bag, next) {
  if (!bag.toValidate) return next();

  var who = bag.who + '|' + _createAdapter.name;
  logger.debug(who, 'Inside');

  bag.gitlabAdapter = new GitlabAdapter(bag.url, bag.providerName);

  return next();
}

function _getProjects(bag, next) {
  if (!bag.toValidate) return next();

  var who = bag.who + '|' + _getProjects.name;
  logger.debug(who, 'Inside');

  bag.gitlabAdapter.getGitlabProjects(
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Unable to getProjects', err)
        );
      return next();
    }
  );
}
