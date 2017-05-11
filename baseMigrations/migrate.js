'use strict';

process.title = 'shippable.migration';
module.exports = migrate;

require('../common/logger.js');
require('../common/ActErr.js');

var async = require('async');
var fs = require('fs-extra');
var pg = require('pg');
var spawn = require('child_process').spawn;
var _ = require('underscore');
var util = require('util');

process.on('uncaughtException',
  function (err) {
    logger.error('uncaughtException thrown:');

    if (err && err.message)
      logger.error(err.message);

    if (err && err.stack)
      logger.error(err.stack);

    setTimeout(
      function () {
        process.exit(1);
      },
      3000
    );
  }
);

function migrate() {
  var bag = {
    stateJson: null,
    postgresClient: null,
    systemConfig: {}
  };

  bag.who = util.format('migrate|%s', migrate.name);

  async.series([
      _readStateJson.bind(null, bag),
      _createPostgresClient.bind(null, bag),
      _createEtcShippable.bind(null, bag),
      _installPsql.bind(null, bag),
      _templateSystemSettingsFile.bind(null, bag),
      _createSystemSettings.bind(null, bag),
      _getSystemConfig.bind(null, bag),
      _getValuesForSystemSettings.bind(null, bag),
      _migrateSystemSettings.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        logger.error('Could not migrate: ', util.inspect(err));
      process.exit();
    }
  );
}

function _readStateJson(bag, next) {
  var who = bag.who + '|' + _readStateJson.name;
  logger.debug(who, 'Inside');

  fs.readJson('./state.json',
    function (err, stateJson) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to read state.json with error: ' + util.inspect(err))
        );

      bag.stateJson = stateJson;
      return next();
    }
  );
}

function _createPostgresClient(bag, next) {
  var who = bag.who + '|' + _createPostgresClient.name;
  logger.debug(who, 'Inside');

  var connectionString = util.format('%s://%s:%s@%s:%s/%s',
    bag.stateJson.systemSettings.dbDialect,
    bag.stateJson.systemSettings.dbUsername,
    bag.stateJson.systemSettings.dbPassword,
    bag.stateJson.systemSettings.dbHost,
    bag.stateJson.systemSettings.dbPort,
    bag.stateJson.systemSettings.dbname);

  bag.postgresClient = new pg.Client(connectionString);
  bag.postgresClient.connect(
    function (err) {
      return next(err);
    }
  );
}

function _createEtcShippable(bag, next) {
  var who = bag.who + '|' + _createEtcShippable.name;
  logger.debug(who, 'Inside');

  fs.mkdirsSync('/etc/shippable/db');
  fs.mkdirsSync('/etc/shippable/msg');
  fs.mkdirsSync('/etc/shippable/redis');
  fs.mkdirsSync('/etc/shippable/secrets');
  fs.mkdirsSync('/etc/shippable/state');

  return next();
}

function _installPsql(bag, next) {
  var who = bag.who + '|' + _installPsql.name;
  logger.debug(who, 'Inside');

  _runScript({
      who: who,
      scriptPath: '/home/shippable/admiral/common/scripts/install_psql.sh',
      scriptEnvs: {}
    },
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to install psql', err)
        );

      return next();
    }
  );
}

function _templateSystemSettingsFile(bag, next) {
  var who = bag.who + '|' + _templateSystemSettingsFile.name;
  logger.verbose(who, 'Inside');

  // Template the script to create the systemSettings table if it doesn't exist

  _templateScript({
      who: who,
      templatePath: '../common/scripts/configs/system_settings.sql.template',
      dataObj: {
        defaultReleaseVersion: bag.stateJson.release
      },
      outputFilename: '/etc/shippable/db/system_settings.sql'
    },
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, 'Failed to write script', err)
        );

      return next();
    }
  );
}

function _createSystemSettings(bag, next) {
  var who = bag.who + '|' + _createSystemSettings.name;
  logger.verbose(who, 'Inside');

  // Create the systemSettings table if it doesn't exist

  _runSQLScript({
      who: who,
      sqlFile: '/etc/shippable/db/system_settings.sql',
      stateJson: bag.stateJson
    },
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create systemSettings', err)
        );

      return next();
    }
  );
}

function _getSystemConfig(bag, next) {
  var who = bag.who + '|' + _getSystemConfig.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * from "systemConfigs";';
  bag.postgresClient.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get systemConfigs with error: ' + util.inspect(err))
        );

      if (!_.isEmpty(res.rows))
        bag.systemConfig = res.rows[0];

      return next();
    }
  );
}

function _getValuesForSystemSettings(bag, next) {
  var who = bag.who + '|' + _getValuesForSystemSettings.name;
  logger.verbose(who, 'Inside');

  var settings = {
    defaultMinionCount:
      __getValueForSystemSettings(bag, 'defaultMinionCount', 1),
    autoSelectBuilderToken:
      __getValueForSystemSettings(bag, 'autoSelectBuilderToken', false),
    buildTimeoutMS:
      __getValueForSystemSettings(bag, 'buildTimeoutMS', 3600000),
    defaultPrivateJobQuota:
      __getValueForSystemSettings(bag, 'defaultPrivateJobQuota', 150),
    serviceUserToken:
      __getValueForSystemSettings(bag, 'serviceUserToken', ''),
    runMode:
      __getValueForSystemSettings(bag, 'runMode', 'production'),
    allowSystemNodes:
      __getValueForSystemSettings(bag, 'allowSystemNodes', false),
    allowDynamicNodes:
      __getValueForSystemSettings(bag, 'allowDynamicNodes', false),
    allowCustomNodes:
      __getValueForSystemSettings(bag, 'allowCustomNodes', false),
    awsAccountId:
      __getValueForSystemSettings(bag, 'awsAccountId', ''),
    jobConsoleBatchSize:
      __getValueForSystemSettings(bag, 'jobConsoleBatchSize', 10),
    jobConsoleBufferTimeIntervalMS:
      __getValueForSystemSettings(bag, 'jobConsoleBufferTimeInterval', 3000),
    apiRetryIntervalMS:
      __getValueForSystemSettings(bag, 'apiRetryInterval', 3),
    truck: __getValueForSystemSettings(bag, 'truck', false),
    hubspotListId: __getValueForSystemSettings(bag, 'hubspotListId', null),
    hubspotShouldSimulate:
      __getValueForSystemSettings(bag, 'hubspotShouldSimulate', null),
    hubspotProjectsLastSyncTime:
      __getValueForSystemSettings(bag, 'hubspotProjectsLastSyncTime', null),
    hubspotRSyncLastSyncTime:
      __getValueForSystemSettings(bag, 'hubspotRSyncLastSyncTime', null),
    rootS3Bucket:
      __getValueForSystemSettings(bag, 'rootS3Bucket', ''),
    nodeScriptsLocation:
      __getValueForSystemSettings(bag, 'nodeScriptsLocation',
        '/home/shippable/scripts/node'),
    enforcePrivateJobQuota:
      __getValueForSystemSettings(bag, 'enforcePrivateJobQuota', false),
    technicalSupportAvailable:
      __getValueForSystemSettings(bag, 'technicalSupportAvailable', false),
    customNodesAdminOnly:
      __getValueForSystemSettings(bag, 'customNodesAdminOnly', false),
    allowedSystemImageFamily:
      __getValueForSystemSettings(bag, 'allowedSystemImageFamily', ''),
    releaseVersion:
      bag.systemConfig.release || bag.stateJson.relase || 'master',
    mktgPageAggsLastDtTm: bag.systemConfig.mktgPageAggsLastDtTm || null,
    mktgCTAAggsLastDtTm: bag.systemConfig.mktgCTAAggsLastDtTm || null,
    defaultMinionInstanceSize:
      __getValueForSystemSettings(bag, 'defaultMinionInstanceSize', null),
    createdAt: bag.systemConfig.createdAt,
    updatedAt: bag.systemConfig.updatedAt
  };

  // These may be seconds or milliseconds in systemConfigs.
  if (settings.jobConsoleBufferTimeIntervalMS < 1000)
    settings.jobConsoleBufferTimeIntervalMS =
      settings.jobConsoleBufferTimeIntervalMS * 1000;
  if (settings.apiRetryIntervalMS < 1000)
    settings.apiRetryIntervalMS = settings.apiRetryIntervalMS * 1000;

  _templateScript({
      who: who,
      templatePath: './migrate_system_settings.sql.template',
      dataObj: settings,
      outputFilename: '/etc/shippable/db/migrate_system_settings.sql'
    },
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, 'Failed to write script', err)
        );
      return next();
    }
  );
}

function _migrateSystemSettings(bag, next) {
  var who = bag.who + '|' + _migrateSystemSettings.name;
  logger.verbose(who, 'Inside');

  // Update the systemSettings table

  _runSQLScript({
      who: who,
      sqlFile: '/etc/shippable/db/migrate_system_settings.sql',
      stateJson: bag.stateJson
    },
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update systemSettings', err)
        );

      return next();
    }
  );
}

function __getValueForSystemSettings(bag, name, defaultValue) {
  if (_.has(bag.systemConfig, name) && bag.systemConfig[name] !== null)
    return bag.systemConfig[name];

  if (_.has(bag.stateJson.systemSettings, name) &&
    bag.stateJson.systemSettings[name] !== null)
    return bag.stateJson.systemSettings[name];

  return defaultValue;
}

function _templateScript(params, next) {
  var who = params.who + '|' + _templateScript.name;
  logger.debug(who, 'Inside');

  var script = __applyTemplate(params.templatePath, params.dataObj);

  fs.writeFile(params.outputFilename, script,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            util.format('%s, Failed with error: %s', who, err))
        );

      fs.chmodSync(params.outputFilename, '755');
      return next();
    }
  );
}

function _runSQLScript(params, next) {
  var who = params.who + '|' + _runSQLScript.name;
  logger.verbose(who, 'Inside');

  var scriptParams = {
    who: params.who,
    scriptPath: './runSQLScript.sh',
    scriptEnvs: {
      'DBUSERNAME': params.stateJson.systemSettings.dbUsername,
      'DBNAME': params.stateJson.systemSettings.dbname,
      'DBHOST': params.stateJson.systemSettings.dbHost,
      'DBPORT': params.stateJson.systemSettings.dbPort,
      'DBPASSWORD': params.stateJson.systemSettings.dbPassword,
      'SQL_FILE': params.sqlFile
    }
  };

  _runScript(scriptParams, next);
}

function _runScript(params, next) {
  var who = params.who + '|' + _runScript.name;
  logger.verbose(who, 'Inside');


  fs.chmodSync(params.scriptPath, '755');

  var exec = spawn('/bin/bash',
    ['-c', params.scriptPath],
    {
      cwd: '/home/shippable/admiral/baseMigrations',
      env: params.scriptEnvs
    }
  );

  exec.stdout.on('data',
    function (data)  {
      console.log(data.toString());
    }
  );

  exec.stderr.on('data',
    function (data)  {
      console.log(data.toString());
    }
  );

  exec.on('close',
    function (exitCode)  {
      if (exitCode > 0)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Script: ' + params.scriptPath + ' returned code: ' + exitCode)
        );

      return next();
    }
  );
}

function __applyTemplate(filePath, dataObj) {
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}


if (require.main === module)
  migrate();
