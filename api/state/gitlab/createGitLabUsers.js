'use strict';

var self = createGitLabUsers;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var fs = require('fs');

var GitLabAdapter = require('../../../common/GitLabAdapter.js');

function createGitLabUsers(gitlabIntegration, callback) {
  var bag = {
    gitlabIntegration: gitlabIntegration
  };

  bag.who = util.format('state|%s', self.name);
  logger.verbose(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _createAdapter.bind(null, bag),
      _getLastSubscriptionId.bind(null, bag),
      _addUsers.bind(null, bag)
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

  if (!bag.gitlabIntegration)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'SystemIntegration parameter not found :gitlabIntegration')
    );

  if (!bag.gitlabIntegration.data.url)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'parameter not found :gitlabIntegration.data.url')
    );

  if (!bag.gitlabIntegration.data.subscriptionProjectLimit)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'parameter not found :gitlabIntegration.data.subscriptionProjectLimit')
    );

  try {
    bag.subscriptionProjectLimit = parseInt(bag.subscriptionProjectLimit, 10);
  } catch (exception) {
    return next(
      new ActErr(who, ActErr.InvalidParam,
        'gitlabIntegration.data.subscriptionProjectLimit is not an integer')
    );
  }

  if (!bag.gitlabIntegration.data.username)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'parameter not found :gitlabIntegration.data.username')
    );

  if (!bag.gitlabIntegration.data.password)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'parameter not found :gitlabIntegration.data.password')
    );

  return next();
}

function _createAdapter(bag, next) {
  var who = bag.who + '|' + _createAdapter.name;
  logger.debug(who, 'Inside');

  bag.gitlabAdapter = new GitLabAdapter(null,
    bag.gitlabIntegration.data.url,
    bag.gitlabIntegration.data.username, bag.gitlabIntegration.data.password);
  bag.gitlabAdapter.initialize(
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'initialize returned error', err)
        );

      return next();
    }
  );
}

function _getLastSubscriptionId(bag, next) {
  var who = bag.who + '|' + _getLastSubscriptionId.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT max("subscriptionId") FROM subscriptions;';
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find last subscription with error: ' + util.inspect(err))
        );

      if (!_.isEmpty(res.rows))
        bag.lastSubscriptionId = res.rows[0].max;

      return next();
    }
  );
}

function _addUsers(bag, next) {
  var who = bag.who + '|' + _addUsers.name;
  logger.verbose(who, 'Inside');

  var nextSubscriptionId = 0;
  var logStream = fs.createWriteStream(
    global.config.runtimeDir + '/logs/state.log', {flags:'a'});

  logStream.write(util.format('Subscriptions 1 to %s will be processed\n',
    bag.lastSubscriptionId));

  async.whilst(
    function () {
      return nextSubscriptionId <= bag.lastSubscriptionId;
    },
    function (done) {
      var seriesBag = {
        nextSubscriptionId: nextSubscriptionId + 1,
        throughSubscriptionId:
          _.min([nextSubscriptionId + 50, bag.lastSubscriptionId]),
        logStream: logStream,
        gitlabAdapter: bag.gitlabAdapter,
        gitlabIntegration: bag.gitlabIntegration,
        who: bag.who,
        resources: []
      };
      async.series([
          _listSubscriptions.bind(null, seriesBag),
          _createSubscriptionUsers.bind(null, seriesBag)
        ],
        function (err) {
          nextSubscriptionId = nextSubscriptionId + 50;
          return done(err);
        }
      );

    },
    function (err) {
      logStream.end();
      return next(err);
    }
  );
}

function _listSubscriptions(seriesBag, next) {
  seriesBag.logStream.write(util.format('Processing subscriptions %s to %s\n',
    seriesBag.nextSubscriptionId, seriesBag.throughSubscriptionId));

  var query = util.format('SELECT id,"propertyBag","sshPublicKey" ' +
    'FROM subscriptions WHERE "subscriptionId" BETWEEN %s AND %s;',
    seriesBag.nextSubscriptionId, seriesBag.throughSubscriptionId);
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr('_listSubscriptions', ActErr.OperationFailed,
            'Failed to find subscriptions with error: ' + util.inspect(err))
        );

      seriesBag.subscriptions = res.rows;
      return next();
    }
  );
}

function _createSubscriptionUsers(seriesBag, next) {
  async.eachSeries(seriesBag.subscriptions,
    function (subscription, done) {
      var subSeriesBag = {
        who: seriesBag.who,
        subscriptionId: subscription.id,
        subscriptionPropertyBag: JSON.parse(subscription.propertyBag),
        subscriptionPublicKey: subscription.sshPublicKey,
        gitlabAdapter: seriesBag.gitlabAdapter,
        subscriptionProjectLimit:
          seriesBag.gitlabIntegration.data.subscriptionProjectLimit,
        logStream: seriesBag.logStream,
        userExists: false,
        groupExists: false,
        keysExist: false
      };
      async.series([
          _getUser.bind(null, subSeriesBag),
          _createUser.bind(null, subSeriesBag),
          _getKeys.bind(null, subSeriesBag),
          _createUserKey.bind(null, subSeriesBag),
          _getGroup.bind(null, subSeriesBag),
          _createSystemGitGroup.bind(null, subSeriesBag),
          _grantPermission.bind(null, subSeriesBag)
        ],
        function (err) {
          if (err)
            seriesBag.logStream.write(util.inspect(err) + '\n');

          return done(err);
        }
      );

    },
    function (err) {
      return next(err);
    }
  );
}

function _getUser(subSeriesBag, next) {
  var who = subSeriesBag.who + '|' + _getUser.name;
  logger.debug(who, 'Inside');

  var query = util.format('username=%s',
    subSeriesBag.subscriptionPropertyBag.nodeUserName);
  subSeriesBag.gitlabAdapter.getUserByUsername(query,
    function (err, user) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'getUser returned error', err)
        );

      if (!_.isEmpty(user)) {
        subSeriesBag.user = _.first(user);
        subSeriesBag.userExists = true;
      }
      return next();
    }
  );
}

function _createUser(subSeriesBag, next) {
  if (subSeriesBag.userExists)
    return next();

  var who = subSeriesBag.who + '|' + _createUser.name;
  logger.debug(who, 'Inside');

  subSeriesBag.gitlabAdapter.postUser(subSeriesBag.subscriptionId,
    subSeriesBag.subscriptionPropertyBag.nodeUserName,
    subSeriesBag.subscriptionPropertyBag.nodePassword,
    subSeriesBag.subscriptionProjectLimit,
    function (err, user) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'postUser returned error', err)
        );
      subSeriesBag.user = user;
      if (user.id)
        subSeriesBag.userExists = true;
      return next();
    }
  );
}

function _getKeys(subSeriesBag, next) {
  if (!subSeriesBag.userExists)
    return next();

  var who = subSeriesBag.who + '|' + _getKeys.name;
  logger.debug(who, 'Inside');

  subSeriesBag.gitlabAdapter.getKeysByUserId(subSeriesBag.user.id,
    function (err, sshKeys) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'getKeysByUserId returned error', err)
        );
      _.each(sshKeys,
        function (sshKey) {
          if (sshKey.key.trim() === subSeriesBag.subscriptionPublicKey.trim())
            subSeriesBag.keysExist = true;
        }
      );
      return next();
    }
  );
}

function _createUserKey(subSeriesBag, next) {
  if (subSeriesBag.keysExist)
    return next();

  var who = subSeriesBag.who + '|' + _createUserKey.name;
  logger.debug(who, 'Inside');

  subSeriesBag.gitlabAdapter.postUserKey(subSeriesBag.user.id,
    subSeriesBag.subscriptionPublicKey,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'postUserKey returned error', err)
        );

      return next();
    }
  );
}

function _getGroup(subSeriesBag, next) {
  var who = subSeriesBag.who + '|' + _getGroup.name;
  logger.debug(who, 'Inside');

  var query = util.format('search=%s', subSeriesBag.subscriptionId);

  subSeriesBag.gitlabAdapter.getGroupByName(query,
    function (err, group) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'getGroupByName returned error', err)
        );

      if (!_.isEmpty(group)) {
        subSeriesBag.groupExists = true;
        subSeriesBag.group = _.first(group);
      }
      return next();
    }
  );
}

function _createSystemGitGroup(subSeriesBag, next) {
  if (subSeriesBag.groupExists)
    return next();

  var who = subSeriesBag.who + '|' + _createSystemGitGroup.name;
  logger.debug(who, 'Inside');

  /* jshint camelcase:false */
  var params = {
    name: subSeriesBag.subscriptionId,
    path: subSeriesBag.subscriptionId,
    visibility_level: subSeriesBag.gitlabAdapter.visibilityLevels.PRIVATE
  };
  /* jshint camelcase:true */

  subSeriesBag.gitlabAdapter.postGroup(params,
    function (err, group) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'postGroup returned error', err)
        );
      subSeriesBag.group = group;
      subSeriesBag.groupExists = true;
      return next();
    }
  );
}

function _grantPermission(subSeriesBag, next) {
  var who = subSeriesBag.who + '|' + _grantPermission.name;
  logger.debug(who, 'Inside');

  /* jshint camelcase:false */
  var params = {
    id: subSeriesBag.group.id,
    user_id: subSeriesBag.user.id,
    access_level: subSeriesBag.gitlabAdapter.groupAccessLevels.OWNER
  };
  /* jshint camelcase:true */

  subSeriesBag.gitlabAdapter.postAddMember(subSeriesBag.group.id, params,
    function (err) {
      if (err && err !== 409)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'postAddMember returned error', err)
        );
      return next();
    }
  );
}
