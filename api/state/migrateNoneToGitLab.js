'use strict';

var self = migrateNoneToGitLab;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var GitLabAdapter = require('../../common/GitLabAdapter.js');

function migrateNoneToGitLab(previousIntegration, gitlabIntegration, resource,
  isStateResource, apiAdapter, callback) {
  var bag = {
    resourceId: resource.id,
    resourceName: resource.name,
    subscriptionId: resource.subscriptionId,
    gitlabIntegration: gitlabIntegration
  };

  bag.who = util.format('state|%s|id:%s', self.name, bag.resourceId);
  logger.verbose(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSubscriptionById.bind(null, bag),
      _createGitLabAdapter.bind(null, bag),
      _getNamespaceId.bind(null, bag),
      _createProject.bind(null, bag)
    ],
    function (err) {
      logger.verbose(bag.who, 'Completed');
      if (err)
        logger.error(err);

      return callback(err);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.debug(who, 'Inside');

  if (!bag.resourceName)
    return next(
      new ActErr(who, ActErr.InvalidParam,
        'parameter not found :resourceName')
    );

  if (!bag.gitlabIntegration)
    return next(
      new ActErr(who, ActErr.InvalidParam,
        'parameter not found :gitlabIntegration')
    );

  return next();
}

function _getSubscriptionById(bag, next) {
  var who = bag.who + '|' + _getSubscriptionById.name;
  logger.debug(who, 'Inside');

  var query = util.format(
    'SELECT "propertyBag" FROM subscriptions WHERE id=\'%s\'',
    bag.subscriptionId);
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find subscription ' + bag.subscriptionId +
            ' with error: ' + util.inspect(err))
        );

      if (!res.rows[0])
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No subscription found for id ' + bag.subscriptionId)
        );

      var propertyBag = JSON.parse(res.rows[0].propertyBag);

      bag.username = propertyBag.nodeUserName;
      bag.password = propertyBag.nodePassword;
      return next();
    }
  );
}

function _createGitLabAdapter(bag, next) {
  var who = bag.who + '|' + _createGitLabAdapter.name;
  logger.debug(who, 'Inside');

  bag.gitlabAdapter = new GitLabAdapter(null,
    bag.gitlabIntegration.data.url, bag.username, bag.password);
  bag.gitlabAdapter.initialize(
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'initialize returned error ' + err + ' with body ' + body)
        );

      return next();
    }
  );
}

function _getNamespaceId(bag, next) {
  var who = bag.who + '|' + _getNamespaceId.name;
  logger.debug(who, 'Inside');

  bag.gitlabAdapter.getNamespaces(
    function (err, namespaces) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'getNamespaces returned error', err)
        );

      if (_.isEmpty(namespaces))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'getNamespaces returned no namespaces')
        );

      var namespace = _.findWhere(namespaces, {kind: 'group'});

      if (!namespace)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'getNamespaces returned no namespace of kind group for ' +
              'subscriptionId: ' + bag.subscriptionId)
        );

      bag.projectNamespaceId = namespace.id;
      return next();
    }
  );
}

function _createProject(bag, next) {
  var who = bag.who + '|' + _createProject.name;
  logger.debug(who, 'Inside');

  var path = bag.resourceName.toLowerCase();
  bag.gitlabAdapter.postProject(bag.resourceName, path,
    bag.gitlabAdapter.visibilityLevels.PRIVATE, bag.projectNamespaceId,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'postProject returned error with status code ' + err +
            'with body ' + util.inspect(body))
        );

      return next();
    }
  );
}
