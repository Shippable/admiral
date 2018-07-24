'use strict';

var self = migrate;
module.exports = self;

var async = require('async');
var fs = require('fs-extra');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');
var configHandler = require('../../common/configHandler.js');
var migrationScripts = {
  amazonKeys: {
    gitlabCreds: require('./migrateS3ToGitLab.js')
  },
  gitlabCreds: {
    amazonKeys: require('./migrateGitLabToS3.js')
  },
  none: {
    gitlabCreds: require('./migrateNoneToGitLab.js')
  }
};
var createGitLabUsers = require('./gitlab/createGitLabUsers.js');

function migrate(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: [],
    res: res,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    skipStatusChange: false,
    params: {},
    component: 'state',
    tmpScript: '/tmp/state.sh'
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _getSystemIntegrations.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _sendResponse.bind(null, bag),
      _createUsers.bind(null, bag),
      _getStateSystemCode.bind(null, bag),
      _getLastResourceId.bind(null, bag),
      _migrateResources.bind(null, bag),
      _printUninstallCommands.bind(null, bag),
      _removePreviousSystemIntegration.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      _setCompleteStatus(bag, err);

      if (err) {
        // only send a response if we haven't already
        if (!bag.isResponseSent)
          respondWithError(bag.res, err);
        else
          logger.warn(err);
      }
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, state) {
      if (err) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );
      }

      if (_.isEmpty(state)) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );
      }

      if (!state.isInitialized) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'State has not been successfully initialized')
        );
      }

      if (state.isFailed)
        bag.skipStatusChange = true;

      bag.config = state;

      if (!bag.config.type)
        bag.config.type = 'gitlabCreds';

      return next();
    }
  );
}

function _getSystemIntegrations(bag, next) {
  var who = bag.who + '|' + _getSystemIntegrations.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('name=state',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integrations: ' + util.inspect(err))
        );

      bag.currentSystemIntegration = _.findWhere(systemIntegrations,
        {masterName: bag.config.type});
      bag.previousSystemIntegration = _.find(systemIntegrations,
        function (integration) {
          return integration.masterName !== bag.config.type;
        }
      );

      return next();
    }
  );
}

function _setProcessingFlag(bag, next) {
  var who = bag.who + '|' + _setProcessingFlag.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: true
  };

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      return next();
    }
  );
}

function _sendResponse(bag, next) {
  var who = bag.who + '|' + _sendResponse.name;
  logger.verbose(who, 'Inside');

  // We reply early so the request won't time out while waiting.

  sendJSONResponse(bag.res, bag.resBody, 202);
  bag.isResponseSent = true;
  return next();
}

function _createUsers(bag, next) {
  if (!bag.currentSystemIntegration ||
    bag.currentSystemIntegration.masterName !== 'gitlabCreds')
    return next();

  var who = bag.who + '|' + _createUsers.name;
  logger.verbose(who, 'Inside');

  createGitLabUsers(bag.currentSystemIntegration,
    function (err) {
      return next(err);
    }
  );
}

function _getStateSystemCode(bag, next) {
  var who = bag.who + '|' + _getStateSystemCode.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "code" FROM "systemCodes" WHERE '+
    '"group"=\'resource\' AND "name"=\'state\'';

  global.config.client.query(query,
    function (err, result) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to fetch state systemCode', err)
        );

      if (_.isEmpty(result.rows) || !result.rows[0].code)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No code found for group: resource and name: state')
        );

      bag.stateSystemCode = result.rows[0].code;
      return next();
    }
  );
}

function _getLastResourceId(bag, next) {
  if (!bag.currentSystemIntegration) return next();
  var who = bag.who + '|' + _getLastResourceId.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT max(id) FROM resources;';
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find last resource with error: ' + util.inspect(err))
        );

      if (!_.isEmpty(res.rows))
        bag.lastResourceId = res.rows[0].max;

      return next();
    }
  );
}

function _migrateResources(bag, next) {
  if (!bag.currentSystemIntegration) return next();
  var who = bag.who + '|' + _migrateResources.name;
  logger.verbose(who, 'Inside');

  var nextResourceId = 0;
  var logStream = fs.createWriteStream(
    global.config.runtimeDir + '/logs/state.log', {flags:'a'});

  logStream.write(util.format('Resources 1 to %s will be processed\n',
    bag.lastResourceId));

  async.whilst(
    function () {
      return nextResourceId <= bag.lastResourceId;
    },
    function (done) {
      var seriesBag = {
        nextResourceId: nextResourceId + 1,
        throughResourceId: _.min([nextResourceId + 50, bag.lastResourceId]),
        logStream: logStream,
        apiAdapter: bag.apiAdapter,
        previousSystemIntegration: bag.previousSystemIntegration,
        currentSystemIntegration: bag.currentSystemIntegration,
        stateSystemCode: bag.stateSystemCode,
        resources: []
      };
      async.series([
          _listResources.bind(null, seriesBag),
          _migrateResource.bind(null, seriesBag)
        ],
        function (err) {
          nextResourceId = nextResourceId + 50;
          if (err)
            logStream.write(util.format(err.message));
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

function _listResources(seriesBag, next) {
  seriesBag.logStream.write(util.format('Processing resources %s to %s\n',
    seriesBag.nextResourceId, seriesBag.throughResourceId));

  var query = util.format('SELECT id,name,"subscriptionId","typeCode" FROM ' +
    'resources WHERE id BETWEEN %s AND %s AND ("isJob"=true OR "typeCode"=%s);',
    seriesBag.nextResourceId, seriesBag.throughResourceId,
    seriesBag.stateSystemCode);
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr('_listResources', ActErr.OperationFailed,
            'Failed to find resources with error: ' + util.inspect(err))
        );

      seriesBag.resources = res.rows;
      return next();
    }
  );
}

function _migrateResource(seriesBag, next) {
  async.eachSeries(seriesBag.resources,
    function (resource, done) {
      var isStateResource = resource.typeCode === seriesBag.stateSystemCode;

      var previousType = (seriesBag.previousSystemIntegration &&
        seriesBag.previousSystemIntegration.masterName) || 'none';

      if (!migrationScripts[previousType])
        return done();

      var migration = migrationScripts[previousType]
        [seriesBag.currentSystemIntegration.masterName];

      if (!migration)
        return done();

      migration(seriesBag.previousSystemIntegration,
        seriesBag.currentSystemIntegration, resource,
        isStateResource, seriesBag.apiAdapter,
        function (err) {
          return done(err);
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _printUninstallCommands(bag, next) {
  if (!bag.currentSystemIntegration || !bag.previousSystemIntegration)
    return next();
  if (bag.previousSystemIntegration.masterName !== 'gitlabCreds')
    return next();
  var who = bag.who + '|' + _printUninstallCommands.name;
  logger.verbose(who, 'Inside');

  var logStream = fs.createWriteStream(
    global.config.runtimeDir + '/logs/state.log', {flags:'a'});

  logStream.write(
    'Migration complete. After confirming that all resources were migrated, ' +
    'you may run the following to uninstall GitLab:\n\n');

  logStream.write('Ubuntu:\n');
  logStream.write(' > sudo gitlab-ctl stop && sudo gitlab-ctl uninstall && '+
    'sudo apt-get -y remove gitlab-ce\n\n');
  logStream.write('CentOS/Red Hat Enterprise Linux:\n');
  logStream.write(' > sudo gitlab-ctl stop && sudo gitlab-ctl uninstall && '+
    'sudo yum remove -y gitlab-ce\n');
  logStream.write('Docker:\n');
  logStream.write(util.format(' > sudo docker stop state && ' +
    'sudo docker rm state && rm -rf %s/state && rm -rf %s/state/data && ' +
    'rm -rf %s/state/logs\n', global.config.configDir, global.config.runtimeDir,
    global.config.runtimeDir));

  logStream.end();

  return next();
}

function _removePreviousSystemIntegration(bag, next) {
  if (!bag.previousSystemIntegration)
    return next();
  var who = bag.who + '|' + _removePreviousSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.deleteSystemIntegration(bag.previousSystemIntegration.id,
    'skipServices=true',
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to delete integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _setCompleteStatus(bag, err) {
  var who = bag.who + '|' + _setCompleteStatus.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: false
  };
  if (err)
    update.isFailed = true;
  else if (!bag.skipStatusChange)
    update.isFailed = false;

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        logger.warn(err);
    }
  );
}
