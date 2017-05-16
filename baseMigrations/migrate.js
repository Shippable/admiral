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
var url = require('url');

global.util = require('util');

var VaultAdapter = require('../common/VaultAdapter.js');
var createOrUpdateSystemIntegration =
  require('./createOrUpdateSystemIntegration.js');

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
      _migrateSystemSettings.bind(null, bag),
      _updateDBConfig.bind(null, bag),
      _updateMsgConfig.bind(null, bag),
      _updateRedisConfig.bind(null, bag),
      _updateSecretsConfig.bind(null, bag),
      _getStateSystemIntegration.bind(null, bag),
      _getStateSystemIntegrationValues.bind(null, bag),
      _updateStateConfig.bind(null, bag),
      _updateMasterConfig.bind(null, bag),
      _updateWorkersConfig.bind(null, bag),
      _readServicesJson.bind(null, bag),
      _updateServicesConfig.bind(null, bag),
      _updateMasterIntegrations.bind(null, bag),
      _updateMasterIntegrationFields.bind(null, bag),
      _createMsgSystemIntegration.bind(null, bag),
      _createRedisSystemIntegration.bind(null, bag),
      _createSSHKeysSystemIntegration.bind(null, bag),
      _createAPISystemIntegration.bind(null, bag),
      _createWWWSystemIntegration.bind(null, bag),
      _createMktgSystemIntegration.bind(null, bag),
      _createAdmiralEnv.bind(null, bag),
      _writePublicMachineKey.bind(null, bag),
      _writePrivateMachineKey.bind(null, bag)
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

function _updateDBConfig(bag, next) {
  var who = bag.who + '|' + _updateDBConfig.name;
  logger.verbose(who, 'Inside');

  var db = {
    address: bag.stateJson.systemSettings.dbHost,
    port: bag.stateJson.systemSettings.dbPort,
    isProcessing: false,
    isFailed: false,
    isInstalled: true,
    isInitialized: true
  };

  var query = util.format('UPDATE "systemSettings" SET "db"=\'%s\';',
    JSON.stringify(db));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update database configs ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _updateMsgConfig(bag, next) {
  var who = bag.who + '|' + _updateMsgConfig.name;
  logger.verbose(who, 'Inside');

  var rabbitMQRootUrl = url.parse(bag.systemConfig.amqpUrlRoot ||
    bag.stateJson.systemSettings.amqpUrlRoot);

  var msg = {
    address: rabbitMQRootUrl.hostname,
    amqpPort: rabbitMQRootUrl.port,
    adminPort: url.parse(bag.systemConfig.amqpUrlAdmin ||
      bag.stateJson.systemSettings.amqpUrlAdmin).port,
    isSecure: (rabbitMQRootUrl.protocol === 'amqp:') ? false : true,
    isShippableManaged: true,
    isProcessing: false,
    isFailed: false,
    isInstalled: true,
    isInitialized: true
  };

  var query = util.format('UPDATE "systemSettings" SET "msg"=\'%s\';',
    JSON.stringify(msg));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update msg config: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _updateRedisConfig(bag, next) {
  var who = bag.who + '|' + _updateRedisConfig.name;
  logger.verbose(who, 'Inside');

  var redisUrl = bag.systemConfig.redisUrl ||
    bag.stateJson.systemSettings.redisUrl;

  var redis = {
    address: redisUrl.split(':')[0],
    port: redisUrl.split(':')[1],
    isShippableManaged: true,
    isProcessing: false,
    isFailed: false,
    isInstalled: true,
    isInitialized: true
  };

  var query = util.format('UPDATE "systemSettings" SET "redis"=\'%s\';',
    JSON.stringify(redis));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update redis config: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _updateSecretsConfig(bag, next) {
  var who = bag.who + '|' + _updateSecretsConfig.name;
  logger.verbose(who, 'Inside');

  bag.vaultUrl = bag.systemConfig.vaultUrl ||
    bag.stateJson.systemSettings.vaultUrl;
  bag.vaultToken = bag.systemConfig.vaultToken ||
    bag.stateJson.systemSettings.vaultToken;
  var parsedVaultUrl = url.parse(bag.vaultUrl);

  var secrets = {
    address: parsedVaultUrl.hostname,
    port: parsedVaultUrl.port,
    isShippableManaged: true,
    isProcessing: false,
    isFailed: false,
    isInstalled: true,
    isInitialized: true
  };


  var query = util.format('UPDATE "systemSettings" SET "secrets"=\'%s\';',
    JSON.stringify(secrets));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update secrets config: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _getStateSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getStateSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "systemIntegrations" WHERE name=\'state\' AND ' +
    '"masterName"=\'gitlabCreds\';';

  bag.postgresClient.query(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get state systemIntegration with error: ' +
            util.inspect(err))
        );

      if (!_.isEmpty(systemIntegrations.rows))
        bag.stateSystemIntegration = systemIntegrations.rows[0];

      return next();
    }
  );
}

function _getStateSystemIntegrationValues(bag, next) {
  if (!bag.stateSystemIntegration) return next();

  var who = bag.who + '|' + _getStateSystemIntegrationValues.name;
  logger.verbose(who, 'Inside');

  var vaultAdapter = new VaultAdapter(bag.vaultUrl, bag.vaultToken);

  var key = util.format('shippable/systemIntegrations/%s',
    bag.stateSystemIntegration.id);
  vaultAdapter.getSecret(key,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to :getSecret for systemIntegrationId: ' +
            bag.stateSystemIntegration.id + ' with status code ' + err, body)
        );

      bag.stateSystemIntegration.data = body.data.data || {};
      return next();
    }
  );
}

function _updateStateConfig(bag, next) {
  var who = bag.who + '|' + _updateStateConfig.name;
  logger.verbose(who, 'Inside');

  var stateUrl;
  var sshPort;
  var password;

  if (bag.stateSystemIntegration) {
    stateUrl = bag.stateSystemIntegration.data.url;
    sshPort = bag.stateSystemIntegration.data.sshPort;
    password = bag.stateSystemIntegration.data.password;
  }

  var stateJsonStateIntegration = _.findWhere(bag.stateJson.systemIntegrations,
    {name: 'state', masterName: 'gitlabCreds'});

  if (stateJsonStateIntegration && !stateUrl) {
    var stateUrlField = _.findWhere(stateJsonStateIntegration.formJSONValues,
      {label: 'url'});
    stateUrl = stateUrlField.value;
  }

  if (stateJsonStateIntegration && !sshPort) {
    var stateSSHPortField =
      _.findWhere(stateJsonStateIntegration.formJSONValues, {label: 'sshPort'});
    sshPort = stateSSHPortField.value;
  }

  if (stateJsonStateIntegration && !password) {
    var statePasswordField =
      _.findWhere(stateJsonStateIntegration.formJSONValues,
      {label: 'password'});
    password = statePasswordField.value;
  }

  var parsedStateUrl = url.parse(stateUrl);

  var state = {
    address: parsedStateUrl.hostname,
    port: (parsedStateUrl.protocol === 'http:' && parsedStateUrl.port) ?
      parsedStateUrl.port : 80,
    sshPort: sshPort,
    securePort:
      (parsedStateUrl.protocol === 'https:' && parsedStateUrl.port) ?
      parsedStateUrl.port : 443,
    isShippableManaged: true,
    isProcessing: false,
    isFailed: false,
    isInstalled: true,
    isInitialized: true
  };

  var query = util.format('UPDATE "systemSettings" SET "state"=\'%s\';',
    JSON.stringify(state));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update state config: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _updateMasterConfig(bag, next) {
  var who = bag.who + '|' + _updateMasterConfig.name;
  logger.verbose(who, 'Inside');

  var swarmMaster = _.find(bag.stateJson.machines,
    function (machine) {
      return machine.group === 'core' &&
        (machine.name === 'swarm' || machine.name === 'localhost');
    }
  );

  var master = {
    address: swarmMaster.ip,
    port: 2377,
    isInstalled: true,
    isInitialized: true
  };

  var query = util.format('UPDATE "systemSettings" SET "master"=\'%s\';',
    JSON.stringify(master));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update master config: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _updateWorkersConfig(bag, next) {
  var who = bag.who + '|' + _updateWorkersConfig.name;
  logger.verbose(who, 'Inside');

  var workers = [];

  _.each(bag.stateJson.machines,
    function (machine) {
      if (machine.group !== 'services')
        return;

      workers.push({
        address: machine.ip,
        port: 2377,
        name: machine.name,
        isInstalled: true,
        isInitialized: true
      });
    }
  );

  var query = util.format('UPDATE "systemSettings" SET "workers"=\'%s\';',
    JSON.stringify(workers));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update workers config: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _readServicesJson(bag, next) {
  var who = bag.who + '|' + _readServicesJson.name;
  logger.debug(who, 'Inside');

  fs.readJson('../common/scripts/configs/services.json',
    function (err, servicesJson) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to read services.json with error: ' + util.inspect(err))
        );

      bag.servicesJson = servicesJson;
      return next();
    }
  );
}

function _updateServicesConfig(bag, next) {
  var who = bag.who + '|' + _updateServicesConfig.name;
  logger.verbose(who, 'Inside');

  var services = {};

  _.each(bag.servicesJson.serviceConfigs,
    function (serviceConfig) {
      var stateJsonService = _.findWhere(bag.stateJson.services,
        {name: serviceConfig.name});

      if (!stateJsonService) {
        services[serviceConfig.name] = {
          serviceName: serviceConfig.name,
          isCore: serviceConfig.isCore,
          replicas: serviceConfig.isGlobal ? 'global' : 1,
          isEnabled: false
        };
        return;
      }

      var replicas;
      if (serviceConfig.isGlobal)
        replicas = 'global';
      else if (_.has(stateJsonService, 'replicas'))
        replicas = stateJsonService.replicas;
      else
        replicas = 1;

      services[serviceConfig.name] = {
        serviceName: serviceConfig.name,
        image: stateJsonService.image,
        isCore: serviceConfig.isCore,
        replicas: replicas,
        isEnabled: true
      };
    }
  );

  var query = util.format('UPDATE "systemSettings" SET "services"=\'%s\';',
    JSON.stringify(services));

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update services config: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _updateMasterIntegrations(bag, next) {
  var who = bag.who + '|' + _updateMasterIntegrations.name;
  logger.verbose(who, 'Inside');

  _runSQLScript({
      who: who,
      sqlFile: '/home/shippable/admiral/common/scripts/configs/' +
        'master_integrations.sql',
      stateJson: bag.stateJson
    },
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update masterIntegrations', err)
        );

      return next();
    }
  );
}

function _updateMasterIntegrationFields(bag, next) {
  var who = bag.who + '|' + _updateMasterIntegrationFields.name;
  logger.verbose(who, 'Inside');

  _runSQLScript({
      who: who,
      sqlFile: '/home/shippable/admiral/common/scripts/configs/' +
        'master_integration_fields.sql',
      stateJson: bag.stateJson
    },
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update masterIntegrationFields', err)
        );

      return next();
    }
  );
}

function _createMsgSystemIntegration(bag, next) {
  var who = bag.who + '|' + _createMsgSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var systemIntegration = {
    name: 'msg',
    masterName: 'rabbitmqCreds',
    data: {
      amqpUrl:
        bag.systemConfig.amqpUrl || bag.stateJson.systemSettings.amqpUrl,
      amqpUrlRoot: bag.systemConfig.amqpUrlRoot ||
        bag.stateJson.systemSettings.amqpUrlRoot,
      amqpUrlAdmin: bag.systemConfig.amqpUrlAdmin ||
        bag.stateJson.systemSettings.amqpUrlAdmin,
      amqpDefaultExchange: bag.systemConfig.amqpDefaultExchange ||
        bag.stateJson.systemSettings.amqpDefaultExchange,
      rootQueueList: bag.systemConfig.rootQueueList ||
        bag.stateJson.systemSettings.rootQueueList
    }
  };

  createOrUpdateSystemIntegration(bag.postgresClient, bag.vaultUrl,
    bag.vaultToken, systemIntegration,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _createRedisSystemIntegration(bag, next) {
  var who = bag.who + '|' + _createRedisSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var systemIntegration = {
    name: 'redis',
    masterName: 'url',
    data: {
      url: bag.systemConfig.redisUrl || bag.stateJson.systemSettings.redisUrl
    }
  };

  createOrUpdateSystemIntegration(bag.postgresClient, bag.vaultUrl,
    bag.vaultToken, systemIntegration,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _createSSHKeysSystemIntegration(bag, next) {
  var who = bag.who + '|' + _createSSHKeysSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var systemIntegration = {
    name: 'sshKeys',
    masterName: 'ssh-key',
    data: {
      publicKey: bag.systemConfig.systemNodePublicKey ||
        bag.stateJson.systemSettings.systemNodePublicKey,
      privateKey: bag.systemConfig.systemNodePrivateKey ||
        bag.stateJson.systemSettings.systemNodePrivateKey
    }
  };

  createOrUpdateSystemIntegration(bag.postgresClient, bag.vaultUrl,
    bag.vaultToken, systemIntegration,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _createAPISystemIntegration(bag, next) {
  var who = bag.who + '|' + _createAPISystemIntegration.name;
  logger.verbose(who, 'Inside');

  var systemIntegration = {
    name: 'api',
    masterName: 'url',
    data: {
      url: bag.systemConfig.apiUrl || bag.stateJson.systemSettings.apiUrl
    }
  };

  createOrUpdateSystemIntegration(bag.postgresClient, bag.vaultUrl,
    bag.vaultToken, systemIntegration,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _createWWWSystemIntegration(bag, next) {
  var who = bag.who + '|' + _createWWWSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var systemIntegration = {
    name: 'www',
    masterName: 'url',
    data: {
      url: bag.systemConfig.wwwUrl || bag.stateJson.systemSettings.wwwUrl
    }
  };

  createOrUpdateSystemIntegration(bag.postgresClient, bag.vaultUrl,
    bag.vaultToken, systemIntegration,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _createMktgSystemIntegration(bag, next) {
  var who = bag.who + '|' + _createMktgSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var systemIntegration = {
    name: 'mktg',
    masterName: 'url',
    data: {
      url: bag.systemConfig.mktgUrl || bag.stateJson.systemSettings.mktgUrl
    }
  };

  createOrUpdateSystemIntegration(bag.postgresClient, bag.vaultUrl,
    bag.vaultToken, systemIntegration,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _createAdmiralEnv(bag, next) {
  /* jshint maxcomplexity:12 */
  var who = bag.who + '|' + _createAdmiralEnv.name;
  logger.verbose(who, 'Inside');

  var admiralEnvValues = {
    loginToken: '',
    dbIP: bag.stateJson.systemSettings.dbHost,
    admiralIP: '',
    accessKey: bag.systemConfig.accessKey ||
      bag.stateJson.systemSettings.installerAccessKey || '',
    secretKey: bag.systemConfig.secretKey ||
      bag.stateJson.systemSettings.installerSecretKey || '',
    serviceUserToken: bag.systemConfig.serviceUserToken ||
      bag.stateJson.systemSettings.serviceUserToken || '',
    release: bag.systemConfig.release || bag.stateJson.relase || 'master',
    dbPort: bag.stateJson.systemSettings.dbPort,
    dbUser: bag.stateJson.systemSettings.dbUsername,
    dbName: bag.stateJson.systemSettings.dbname,
    dbPassword: bag.stateJson.systemSettings.dbPassword,
    dbDialect: bag.stateJson.systemSettings.dbDialect,
    runMode: bag.systemConfig.runMode || bag.stateJson.systemSettings.runMode ||
      'production',
    sshUser: 'root',
    vaultUrl: bag.vaultUrl,
    vaultToken: bag.vaultToken,
    workerJoinToken: bag.stateJson.systemSettings.swarmWorkerToken || '',
  };

  var admiralEnv = __applyTemplate('./admiral.env.template', admiralEnvValues);

  fs.writeFile('/etc/shippable/admiral.env', admiralEnv,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to write admiral.env', err)
        );

      return next();
    }
  );
}

function _writePublicMachineKey(bag, next) {
  var who = bag.who + '|' + _writePublicMachineKey.name;
  logger.verbose(who, 'Inside');

  var publicKey = bag.systemConfig.systemNodePublicKey ||
    bag.stateJson.systemSettings.systemNodePublicKey;

  fs.writeFile('/etc/shippable/machinekey.pub', publicKey,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            util.format('%s, Failed with error: %s', who, err))
        );

      fs.chmodSync('/etc/shippable/machinekey.pub', '644');
      return next();
    }
  );
}

function _writePrivateMachineKey(bag, next) {
  var who = bag.who + '|' + _writePrivateMachineKey.name;
  logger.verbose(who, 'Inside');

  var privateKey = bag.systemConfig.systemNodePrivateKey ||
    bag.stateJson.systemSettings.systemNodePrivateKey;

  fs.writeFile('/etc/shippable/machinekey', privateKey,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            util.format('%s, Failed with error: %s', who, err))
        );

      fs.chmodSync('/etc/shippable/machinekey', '600');
      return next();
    }
  );
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
      logger.debug(who, data.toString());
    }
  );

  exec.stderr.on('data',
    function (data)  {
      logger.error(who, data.toString());
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
