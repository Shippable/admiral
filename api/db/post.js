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

function post(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {},
    skipStatusChange: false,
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: '',
    setServiceUserToken: false,
    accessKeyEnv: 'ACCESS_KEY',
    secretKeyEnv: 'SECRET_KEY'
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _upsertSystemConfigs.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _generateServiceUserToken.bind(null, bag),
      _setServiceUserToken.bind(null, bag),
      _upsertSystemCodes.bind(null, bag),
      _upsertMasterIntegrations.bind(null, bag),
      _upsertMasterIntegrationFields.bind(null, bag),
      _upsertSystemIntegrations.bind(null, bag),
      _readPublicSSHKey.bind(null, bag),
      _readPrivateSSHKey.bind(null, bag),
      _saveSSHKeys.bind(null, bag),
      _getAccessKey.bind(null, bag),
      _getSecretKey.bind(null, bag),
      _checkIsBootstrapped.bind(null, bag),
      _runMigrationsBeforeAPIStart.bind(null, bag),
      _startFakeAPI.bind(null, bag),
      _setIsBootstrapped.bind(null, bag),
      _runMigrations.bind(null, bag),
      _templateServiceUserAccountFile.bind(null, bag),
      _upsertServiceUserAccount.bind(null, bag),
      _setDbFlags.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (!bag.skipStatusChange) {
        _setCompleteStatus(bag, err);
      }

      if (err)
        return respondWithError(res, err);



      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _upsertSystemConfigs(bag, next) {
  var who = bag.who + '|' + _upsertSystemConfigs.name;
  logger.verbose(who, 'Inside');

  _copyAndRunScript({
      who: who,
      params: {},
      script: '',
      scriptPath: 'create_sys_configs.sh',
      tmpScriptFilename: '/tmp/systemConfigs.sh',
      scriptEnvs: {
        'RUNTIME_DIR': global.config.runtimeDir,
        'CONFIG_DIR': global.config.configDir,
        'SCRIPTS_DIR': global.config.scriptsDir,
        'DBUSERNAME': global.config.dbUsername,
        'DBNAME': global.config.dbName,
        'RELEASE': global.config.release
      }
    },
    function (err) {
      if (err)
        bag.skipStatusChange = true;
      return next(err);
    }
  );
}

function _setProcessingFlag(bag, next) {
  var who = bag.who + '|' + _setProcessingFlag.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: true,
    isFailed: false
  };

  configHandler.put('db', update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, err)
        );

      return next();
    }
  );
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
        'DBNAME': global.config.dbName
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
        'DBNAME': global.config.dbName
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
        'DBNAME': global.config.dbName
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
        'DBNAME': global.config.dbName
      }
    },
    function (err) {
      return next(err);
    }
  );
}

function _readPublicSSHKey(bag, next) {
  var who = bag.who + '|' + _readPublicSSHKey.name;
  logger.verbose(who, 'Inside');

  var publicKey = path.join(global.config.configDir, 'machinekey.pub');
  fs.readFile(publicKey,
    function (err, data) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, err)
        );

      bag.publicSSHKey = data.toString();

      return next();
    }
  );
}

function _readPrivateSSHKey(bag, next) {
  var who = bag.who + '|' + _readPrivateSSHKey.name;
  logger.verbose(who, 'Inside');

  var publicKey = path.join(global.config.configDir, 'machinekey');
  fs.readFile(publicKey,
    function (err, data) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, err)
        );

      bag.privateSSHKey = data.toString();

      return next();
    }
  );
}

function _saveSSHKeys(bag, next) {
  var who = bag.who + '|' +  _saveSSHKeys.name;
  logger.verbose(who, 'Inside');

  var query = util.format(
    'UPDATE "systemConfigs" set ' +
    ' "systemNodePrivateKey"=\'%s\',' +
    ' "systemNodePublicKey"=\'%s\';', bag.privateSSHKey, bag.publicSSHKey);


  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (response.rowCount === 1) {
        logger.debug('Successfully updated ssh keys in database');
      } else {
        logger.warn('Failed to update ssh keys in database');
      }

      return next();
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

function _checkIsBootstrapped(bag, next) {
  var who = bag.who + '|' + _checkIsBootstrapped.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "isBootstrapped" FROM "systemConfigs"';

  global.config.client.query(query,
    function (err, systemConfigs) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (!_.isEmpty(systemConfigs.rows) &&
        !_.isEmpty(systemConfigs.rows[0])) {

        bag.isBootstrapped = systemConfigs.rows[0].isBootstrapped;
        return next();
      }

      return next(
        new ActErr(who, ActErr.DataNotFound, 'No systemConfigs found')
      );
    }
  );
}

function _runMigrationsBeforeAPIStart(bag, next) {
  if (!bag.isBootstrapped) return next();
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
        'DBNAME': global.config.dbName
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
        'RELEASE': global.config.release,
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

function _setIsBootstrapped(bag, next) {
  if (bag.isBootstrapped) return next();
  var who = bag.who + '|' + _setIsBootstrapped.name;
  logger.verbose(who, 'Inside');


  var query = 'UPDATE "systemConfigs" set "isBootstrapped"=true';

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (response.rowCount === 1) {
        logger.debug('Successfully updated isBootstrapped');
      } else {
        logger.warn('Failed to update isBootstrapped');
      }

      return next();
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
        'DBNAME': global.config.dbName
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
          new ActErr(who, ActErr.OperationFailed, err)
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
        'DBNAME': global.config.dbName
      }
    },
    function (err) {
      return next(err);
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
          new ActErr(who, ActErr.OperationFailed, err)
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
