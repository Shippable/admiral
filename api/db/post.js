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

function post(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {},
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: '',
    setServiceUserToken: false
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _upsertSystemConfigs.bind(null, bag),
      _generateServiceUserToken.bind(null, bag),
      _setServiceUserToken.bind(null, bag),
      _upsertSystemCodes.bind(null, bag),
      _upsertMasterIntegrations.bind(null, bag),
      _upsertMasterIntegrationFields.bind(null, bag),
      _upsertSystemIntegrations.bind(null, bag),
      _readPublicSSHKey.bind(null, bag),
      _readPrivateSSHKey.bind(null, bag),
      _saveSSHKeys.bind(null, bag),
      _setDbFlags.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
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
      scriptPath: '../../common/scripts/create_sys_configs.sh',
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
      return next(err);
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
      scriptPath: '../../common/scripts/create_system_codes.sh',
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
      scriptPath: '../../common/scripts/create_master_integrations.sh',
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
      scriptPath: '../../common/scripts/create_master_integration_fields.sh',
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
      scriptPath: '../../common/scripts/create_system_integrations.sh',
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
        logger.debug('Successfully initialized the database');
      } else {
        logger.warn('Failed to initialize the database');
      }

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

  var query = util.format('UPDATE "systemConfigs" set db=\'%s\';',
    JSON.stringify(update));

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (response.rowCount === 1) {
        logger.debug('Successfully initialized the database');
      } else {
        logger.warn('Failed to initialize the database');
      }

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
  script = script.concat(
    __applyTemplate('../../lib/_logger.sh', seriesBag.params));

  script = script.concat(
    __applyTemplate(seriesBag.scriptPath, seriesBag.params));

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
      return next(exitCode);
    }
  );
}

//local function to apply vars to template
function __applyTemplate(fileName, dataObj) {
  var filePath = path.join(__dirname, fileName);
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}
