'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');
var path = require('path');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;

var envHandler = require('../../common/envHandler.js');
var configHandler = require('../../common/configHandler.js');
var APIAdapter = require('../../common/APIAdapter.js');

function post(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {},
    res: res,
    skipStatusChange: false,
    isResponseSent: false,
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    serviceUserToken: '',
    setServiceUserToken: false,
    accessKeyEnv: 'ACCESS_KEY',
    secretKeyEnv: 'SECRET_KEY'
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getReleaseVersionFromAdmiralEnv.bind(null, bag),
      _templateSystemSettingsFile.bind(null, bag),
      _upsertSystemSettings.bind(null, bag),
      _getReleaseVersionFromSystemSettings.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _sendResponse.bind(null, bag),
      _generateServiceUserToken.bind(null, bag),
      _setServiceUserToken.bind(null, bag),
      _upsertSystemCodes.bind(null, bag),
      _upsertMasterIntegrations.bind(null, bag),
      _upsertMasterIntegrationFields.bind(null, bag),
      _upsertSystemIntegrations.bind(null, bag),
      _getAccessKey.bind(null, bag),
      _getSecretKey.bind(null, bag),
      _checkIsInitialized.bind(null, bag),
      _runMigrationsBeforeAPIStart.bind(null, bag),
      _startFakeAPI.bind(null, bag),
      _runMigrations.bind(null, bag),
      _templateServiceUserAccountFile.bind(null, bag),
      _upsertServiceUserAccount.bind(null, bag),
      _templateDefaultSystemMachineImageFile.bind(null, bag),
      _upsertDefaultSystemMachineImage.bind(null, bag),
      _getRootBucket.bind(null, bag),
      _setRootBucket.bind(null, bag),
      _setDbFlags.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (!bag.skipStatusChange)
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

function _getReleaseVersionFromAdmiralEnv(bag, next) {
  var who = bag.who + '|' + _getReleaseVersionFromAdmiralEnv.name;
  logger.verbose(who, 'Inside');

  // This releaseVersion will be used if there aren't any systemSettings yet.

  bag.apiAdapter.getAdmiralEnv(
    function (err, admiralEnv) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get admiralEnv : ' + util.inspect(err))
        );

      bag.admiralEnvReleaseVersion = admiralEnv.RELEASE;

      return next();
    }
  );
}

function _templateSystemSettingsFile(bag, next) {
  var who = bag.who + '|' + _templateServiceUserAccountFile.name;
  logger.verbose(who, 'Inside');

  var filePath = util.format('%s/db/system_settings.sql',
    global.config.configDir);
  var templatePath =
    util.format('%s/configs/system_settings.sql.template',
      global.config.scriptsDir);
  var dataObj = {
    defaultReleaseVersion: bag.admiralEnvReleaseVersion
  };

  var script = {
    tmpScriptFilename: filePath,
    script: __applyTemplate(templatePath, dataObj)
  };

  _writeScriptToFile(script,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, 'Failed to write script', err)
        );

      return next();
    }
  );
}

function _upsertSystemSettings(bag, next) {
  var who = bag.who + '|' + _upsertSystemSettings.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_system_settings.sh',
      tmpScriptFilename: '/tmp/systemSettings.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      if (err)
        bag.skipStatusChange = true;
      return next(err);
    }
  );
}

function _getReleaseVersionFromSystemSettings(bag, next) {
  var who = bag.who + '|' + _getReleaseVersionFromSystemSettings.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemSettings(query,
    function (err, systemSettings) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system settings : ' + util.inspect(err))
        );

      bag.releaseVersion = systemSettings.releaseVersion;

      return next();
    }
  );
}

function _setProcessingFlag(bag, next) {
  var who = bag.who + '|' + _setProcessingFlag.name;
  logger.verbose(who, 'Inside');

  var update = {
    address: global.config.dbHost,
    port: global.config.dbPort,
    isProcessing: true,
    isFailed: false
  };

  configHandler.put('db', update,
    function (err, config) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update db config', err)
        );

      bag.resBody = config;
      return next();
    }
  );
}

function _sendResponse(bag, next) {
  var who = bag.who + '|' + _sendResponse.name;
  logger.verbose(who, 'Inside');

  // We reply early so the request won't time out while
  // waiting for the service to start.

  sendJSONResponse(bag.res, bag.resBody, 202);
  bag.isResponseSent = true;
  return next();
}

function _generateServiceUserToken(bag, next) {
  var who = bag.who + '|' + _generateServiceUserToken.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.serviceUserTokenEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.serviceUserTokenEnv)
        );

      if (_.isEmpty(value)) {
        logger.debug('Empty service user token, generating a new token');
        bag.serviceUserToken = uuid.v4();
        bag.setServiceUserToken = true;
      } else {
        logger.debug('Found existing service user token');
        bag.serviceUserToken = value;
      }

      return next();
    }
  );
}

function _setServiceUserToken(bag, next) {
  if (!bag.setServiceUserToken) return next();

  var who = bag.who + '|' + _setServiceUserToken.name;
  logger.verbose(who, 'Inside');

  envHandler.put(bag.serviceUserTokenEnv, bag.serviceUserToken,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot set env: ' + bag.serviceUserTokenEnv + ' err: ' + err)
        );

      return next();
    }
  );
}

function _upsertSystemCodes(bag, next) {
  var who = bag.who + '|' + _upsertSystemCodes.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_system_codes.sh',
      tmpScriptFilename: '/tmp/systemCodes.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _upsertMasterIntegrations(bag, next) {
  var who = bag.who + '|' + _upsertMasterIntegrations.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_master_integrations.sh',
      tmpScriptFilename: '/tmp/masterIntegrations.sh',
      scriptEnvs: {
        'CONFIG_DIR': global.config.configDir,
        'RUNTIME_DIR': global.config.runtimeDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _upsertMasterIntegrationFields(bag, next) {
  var who = bag.who + '|' + _upsertMasterIntegrationFields.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_master_integration_fields.sh',
      tmpScriptFilename: '/tmp/masterIntegrationFields.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _upsertSystemIntegrations(bag, next) {
  var who = bag.who + '|' + _upsertSystemIntegrations.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_system_integrations.sh',
      tmpScriptFilename: '/tmp/systemIntegrations.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _getAccessKey(bag, next) {
  var who = bag.who + '|' + _getAccessKey.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.accessKeyEnv,
    function (err, accessKey) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.accessKeyEnv)
        );

      bag.accessKey = accessKey;
      logger.debug('Found access key');

      return next();
    }
  );
}

function _getSecretKey(bag, next) {
  var who = bag.who + '|' + _getSecretKey.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.secretKeyEnv,
    function (err, secretKey) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.secretKeyEnv)
        );

      bag.secretKey = secretKey;
      logger.debug('Found secret key');

      return next();
    }
  );
}

function _checkIsInitialized(bag, next) {
  var who = bag.who + '|' + _checkIsInitialized.name;
  logger.verbose(who, 'Inside');

  configHandler.get('db',
    function (err, db) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(db))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No config found')
        );

      bag.isInitialized = db.isInitialized;
      return next();
    }
  );
}

function _runMigrationsBeforeAPIStart(bag, next) {
  if (!bag.isInitialized) return next();
  var who = bag.who + '|' + _runMigrationsBeforeAPIStart.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'migrate.sh',
      tmpScriptFilename: '/tmp/migrate.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'MIGRATIONS_DIR': global.config.migrationsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _startFakeAPI(bag, next) {
  var who = bag.who + '|' + _startFakeAPI.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'docker/startFakeAPI.sh',
      tmpScriptFilename: '/tmp/startFakeAPI.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'RELEASE': bag.releaseVersion,
        'DBNAME': global.config.dbName,
        'DBUSERNAME': global.config.dbUsername,
        'DBPASSWORD': global.config.dbPassword,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBDIALECT': global.config.dbDialect,
        'ACCESS_KEY': bag.accessKey,
        'SECRET_KEY': bag.secretKey,
        'PRIVATE_IMAGE_REGISTRY': global.config.privateImageRegistry
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _runMigrations(bag, next) {
  var who = bag.who + '|' + _runMigrations.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'migrate.sh',
      tmpScriptFilename: '/tmp/migrate.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'MIGRATIONS_DIR': global.config.migrationsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _templateServiceUserAccountFile(bag, next) {
  var who = bag.who + '|' + _templateServiceUserAccountFile.name;
  logger.verbose(who, 'Inside');

  var filePath = util.format('%s/db/service_user_account.sql',
    global.config.configDir);
  var templatePath =
    util.format('%s/configs/service_user_account.sql.template',
      global.config.scriptsDir);
  var dataObj = {
    serviceUserToken: bag.serviceUserToken
  };

  var script = {
    tmpScriptFilename: filePath,
    script: __applyTemplate(templatePath, dataObj)
  };

  _writeScriptToFile(script,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, 'Failed to write script', err)
        );

      return next();
    }
  );
}

function _upsertServiceUserAccount(bag, next) {
  var who = bag.who + '|' + _upsertServiceUserAccount.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_service_user_account.sh',
      tmpScriptFilename: '/tmp/serviceUserAccount.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}


function _templateDefaultSystemMachineImageFile(bag, next) {
  var who = bag.who + '|' + _templateDefaultSystemMachineImageFile.name;
  logger.verbose(who, 'Inside');

  var filePath = util.format('%s/db/default_system_machine_image.sql',
    global.config.configDir);
  var templatePath =
    util.format('%s/configs/default_system_machine_image.sql.template',
      global.config.scriptsDir);
  var dataObj = {
    releaseVersion: bag.releaseVersion
  };

  var script = {
    tmpScriptFilename: filePath,
    script: __applyTemplate(templatePath, dataObj)
  };

  _writeScriptToFile(script,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, 'Failed to write script', err)
        );

      return next();
    }
  );
}

function _upsertDefaultSystemMachineImage(bag, next) {
  var who = bag.who + '|' + _upsertDefaultSystemMachineImage.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_default_system_machine_image.sh',
      tmpScriptFilename: '/tmp/defaultSystemMachineImage.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'DBHOST': global.config.dbHost,
        'DBPORT': global.config.dbPort,
        'DBPASSWORD': global.config.dbPassword
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _getRootBucket(bag, next) {
  var who = bag.who + '|' + _getRootBucket.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "rootS3Bucket" from "systemSettings";';
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find rootS3Bucket setting with error: ' +
            util.inspect(err))
        );

      if (!_.isEmpty(res.rows) && !_.isEmpty(res.rows[0].rootS3Bucket))
        bag.rootS3Bucket = res.rows[0].rootS3Bucket;

      return next();
    }
  );
}

function _setRootBucket(bag, next) {
  if (!_.isEmpty(bag.rootS3Bucket)) return next();

  var who = bag.who + '|' + _setRootBucket.name;
  logger.verbose(who, 'Inside');

  var rootS3Bucket = util.format('shippable-%s-%s',
    global.config.runMode, uuid.v4());

  var query = util.format(
    'UPDATE "systemSettings" set "rootS3Bucket"=\'%s\';', rootS3Bucket);
  global.config.client.query(query,
    function (err, rootS3Bucket) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update rootS3Bucket setting with error: ' +
            util.inspect(err))
        );
      bag.rootS3Bucket = rootS3Bucket;
      return next();
    }
  );
}

function _setDbFlags(bag, next) {
  var who = bag.who + '|' + _setDbFlags.name;
  logger.verbose(who, 'Inside');

  var update = {
    isInstalled: true,
    isInitialized: true
  };

  configHandler.put('db', update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update db config', err)
        );

      return next();
    }
  );
}

function _copyAndRunScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _copyAndRunScript.name;
  logger.verbose(who, 'Inside');

  async.series([
      _generateScript.bind(null, seriesBag),
      _writeScriptToFile.bind(null, seriesBag),
      _runScript.bind(null, seriesBag)
    ],
    function (err) {
      fs.remove(seriesBag.tmpScriptFilename,
        function (error) {
          if (error)
            logger.warn(
              util.format('%s, Failed to remove %s %s', who, path, error)
            );
        }
      );
      return next(err);
    }
  );
}

function _generateScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _generateScript.name;
  logger.verbose(who, 'Inside');

  var script = '';
  //attach header
  var filePath = path.join(global.config.scriptsDir, '/lib/_logger.sh');
  script = script.concat(__applyTemplate(filePath, seriesBag.params));

  filePath = path.join(global.config.scriptsDir, seriesBag.scriptPath);
  script = script.concat(__applyTemplate(filePath, seriesBag.params));

  seriesBag.script = script;
  return next();
}

function _writeScriptToFile(seriesBag, next) {
  var who = seriesBag.who + '|' + _writeScriptToFile.name;
  logger.debug(who, 'Inside');

  fs.writeFile(seriesBag.tmpScriptFilename, seriesBag.script,
    function (err) {
      if (err) {
        var msg = util.format('%s, Failed with err:%s', who, err);
        return next(
          new ActErr(who, ActErr.OperationFailed, msg)
        );
      }
      fs.chmodSync(seriesBag.tmpScriptFilename, '755');
      return next();
    }
  );
}

function _runScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _runScript.name;
  logger.verbose(who, 'Inside');

  var exec = spawn('/bin/bash',
    ['-c', seriesBag.tmpScriptFilename],
    {
      cwd: '/',
      env: seriesBag.scriptEnvs
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
            'Script: ' + seriesBag.tmpScriptFilename + ' returned code: ' +
          exitCode)
        );
      return next();
    }
  );
}

//local function to apply vars to template
function __applyTemplate(filePath, dataObj) {
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}

function _setCompleteStatus(bag, err) {
  var who = bag.who + '|' + _setCompleteStatus.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: false
  };
  if (err)
    update.isFailed = true;
  else
    update.isFailed = false;

  configHandler.put('db', update,
    function (err) {
      if (err)
        logger.warn(err);
    }
  );
}
