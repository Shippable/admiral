'use strict';

var self = initialize;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var envHandler = require('../../common/envHandler.js');
var configHandler = require('../../common/configHandler.js');
var APIAdapter = require('../../common/APIAdapter.js');
var VaultAdapter = require('../../common/VaultAdapter.js');

function initialize(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    res: res,
    params: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    skipStatusChange: false,
    isResponseSent: false,
    component: 'secrets',
    tmpScript: '/tmp/secrets.sh',
    vaultUrlEnv: 'VAULT_URL'
  };

  bag.who = util.format('secrets|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _checkConfig.bind(null, bag),
      _getReleaseVersion.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _sendResponse.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _installVault.bind(null, bag),
      _checkInitStatus.bind(null, bag),
      _getUnsealKeys.bind(null, bag),
      _saveUnsealKeys.bind(null, bag),
      _setVaultRootToken.bind(null, bag),
      _unsealVaultStep1.bind(null, bag),
      _unsealVaultStep2.bind(null, bag),
      _unsealVaultStep3.bind(null, bag),
      _createSecretsMount.bind(null, bag),
      _updatePolicy.bind(null, bag),
      _post.bind(null, bag),
      _updateVaultUrl.bind(null, bag)
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

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, secrets) {
      if (err) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );
      }

      if (_.isEmpty(secrets)) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );
      }

      bag.config = secrets;
      bag.vaultUrl = util.format('http://%s:%s',
        bag.config.address, bag.config.port);
      return next();
    }
  );
}

function _checkConfig(bag, next) {
  /* jshint maxcomplexity:15 */
  var who = bag.who + '|' + _checkConfig.name;
  logger.verbose(who, 'Inside');

  var missingConfigFields = [];

  if (!_.has(bag.config, 'address') || _.isEmpty(bag.config.address))
    missingConfigFields.push('address');
  if (!_.has(bag.config, 'port') || !_.isNumber(bag.config.port))
    missingConfigFields.push('port');

  if (missingConfigFields.length)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing config data: ' + missingConfigFields.join())
    );

  return next();
}

function _getReleaseVersion(bag, next) {
  var who = bag.who + '|' + _getReleaseVersion.name;
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
    isProcessing: true,
    isFailed: false
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

  // We reply early so the request won't time out while
  // waiting for the service to start.

  sendJSONResponse(bag.res, bag.resBody, 202);
  bag.isResponseSent = true;
  return next();
}

function _generateInitializeEnvs(bag, next) {
  var who = bag.who + '|' + _generateInitializeEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'RUNTIME_DIR': global.config.runtimeDir,
    'CONFIG_DIR': global.config.configDir,
    'RELEASE': bag.releaseVersion,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'IS_INSTALLED': bag.config.isInstalled,
    'ADMIRAL_IP': global.config.admiralIP,
    'DBUSERNAME': global.config.dbUsername,
    'DBPASSWORD': global.config.dbPassword,
    'DBHOST': global.config.dbHost,
    'DBPORT': global.config.dbPort,
    'DBNAME': global.config.dbName,
    'VAULT_HOST': bag.config.address,
    'SSH_USER': global.config.sshUser,
    'SSH_PRIVATE_KEY': path.join(global.config.configDir, 'machinekey'),
    'SSH_PUBLIC_KEY': path.join(global.config.configDir, 'machinekey.pub'),
    'VAULT_PORT': bag.config.port
  };

  return next();
}

function _generateInitializeScript(bag, next) {
  var who = bag.who + '|' + _generateInitializeScript.name;
  logger.verbose(who, 'Inside');

  //attach header
  var filePath = path.join(global.config.scriptsDir, '/lib/_logger.sh');
  var headerScript = '';
  headerScript = headerScript.concat(__applyTemplate(filePath, bag.params));

  var helpers = headerScript;
  filePath = path.join(global.config.scriptsDir, '/lib/_helpers.sh');
  helpers = headerScript.concat(__applyTemplate(filePath, bag.params));

  var initializeScript = helpers;
  filePath = path.join(global.config.scriptsDir, 'installVault.sh');
  initializeScript = initializeScript.concat(__applyTemplate(filePath, bag.params));

  bag.script = initializeScript;
  return next();
}

function _writeScriptToFile(bag, next) {
  var who = bag.who + '|' + _writeScriptToFile.name;
  logger.debug(who, 'Inside');

  fs.writeFile(bag.tmpScript,
    bag.script,
    function (err) {
      if (err) {
        var msg = util.format('%s, Failed with err:%s', who, err);
        return next(
          new ActErr(
            who, ActErr.OperationFailed, msg)
        );
      }
      fs.chmodSync(bag.tmpScript, '755');
      return next();
    }
  );
}


function _installVault(bag, next) {
  var who = bag.who + '|' + _installVault.name;
  logger.verbose(who, 'Inside');

  var exec = spawn('/bin/bash',
    ['-c', bag.tmpScript],
    {
      env: bag.scriptEnvs
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
            'Script returned code: ' + exitCode)
        );
      return next();
    }
  );
}

function _checkInitStatus(bag, next) {
  var who = bag.who + '|' + _checkInitStatus.name;
  logger.verbose(who, 'Inside');

  var client = new VaultAdapter(bag.vaultUrl);

  client.getInitializedStatus(
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get vault initialized status: ' + util.inspect(err))
        );

      if (response.initialized === true) {
        logger.debug('Vault already initialized');

        if (_.isEmpty(bag.config.unsealKey1) ||
          _.isEmpty(bag.config.unsealKey2) ||
            _.isEmpty(bag.config.unsealKey3) ||
              _.isEmpty(bag.config.unsealKey4) ||
                _.isEmpty(bag.config.unsealKey5) ||
                  _.isEmpty(bag.config.rootToken)) {

          return next(
            new ActErr(who, ActErr.OperationFailed,
              'Vault needs 5 unseal keys. One(or more) unseal keys are ' +
              ' missing. Reset vault server or make sure keys are present')
          );
        }
        bag.config.isInitialized = response.initialized;
        bag.config.isSealed = response.sealed;
      } else {
        bag.config.isInitialized = false;
      }
      return next();
    }
  );
}

function _getUnsealKeys(bag, next) {
  if (bag.config.isInitialized) return next();

  var who = bag.who + '|' + _getUnsealKeys.name;
  logger.verbose(who, 'Inside');

  var client = new VaultAdapter(bag.vaultUrl);
  var params = {
    secret_shares: 5,
    secret_threshold: 3
  };
  client.init(params,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to initialize vault: ' + util.inspect(err))
        );
      bag.config.unsealKey1 = response.keys[0];
      bag.config.unsealKey2 = response.keys[1];
      bag.config.unsealKey3 = response.keys[2];
      bag.config.unsealKey4 = response.keys[3];
      bag.config.unsealKey5 = response.keys[4];
      bag.config.rootToken  = response.root_token;

      logger.debug('Successfully fetched unseal keys for vault');
      return next();
    }
  );
}

function _saveUnsealKeys(bag, next) {
  if (bag.config.isInitialized) return next();

  var who = bag.who + '|' + _saveUnsealKeys.name;
  logger.verbose(who, 'Inside');

  configHandler.put(bag.component, bag.config,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to save unseal keys: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _setVaultRootToken(bag, next) {
  if (bag.config.isInitialized) return next();

  var who = bag.who + '|' + _setVaultRootToken.name;
  logger.verbose(who, 'Inside');

  envHandler.put('VAULT_TOKEN', bag.config.rootToken,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get VAULT_TOKEN with error: ' + err)
        );

      return next();
    }
  );
}

function _unsealVaultStep1(bag, next) {
  if (bag.config.isSealed) return next();

  var who = bag.who + '|' + _unsealVaultStep1.name;
  logger.verbose(who, 'Inside');

  var client = new VaultAdapter(bag.vaultUrl);

  var params = {
    secret_shares: 3,
    key: bag.config.unsealKey1
  };

  client.unseal(params,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to unseal vault: ' + util.inspect(err))
        );
      logger.debug('Unseal response: ' + util.inspect(response));
      return next();
    }
  );
}

function _unsealVaultStep2(bag, next) {
  if (bag.config.isSealed) return next();

  var who = bag.who + '|' + _unsealVaultStep2.name;
  logger.verbose(who, 'Inside');

  var params = {
    secret_shares: 3,
    key: bag.config.unsealKey2
  };

  var client = new VaultAdapter(bag.vaultUrl);

  client.unseal(params,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to unseal vault: ' + util.inspect(err))
        );

      logger.debug('Unseal response: ' + util.inspect(response));
      return next();
    }
  );
}

function _unsealVaultStep3(bag, next) {
  if (bag.config.isSealed) return next();

  var who = bag.who + '|' + _unsealVaultStep3.name;
  logger.verbose(who, 'Inside');
  var params = {
    secret_shares: 3,
    key: bag.config.unsealKey3
  };

  var client = new VaultAdapter(bag.vaultUrl);

  client.unseal(params,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to unseal vault: ' + util.inspect(err))
        );

      logger.debug('Unseal response: ' + util.inspect(response));
      return next();
    }
  );
}

function _createSecretsMount(bag, next) {
  var who = bag.who + '|' + _createSecretsMount.name;
  logger.verbose(who, 'Inside');

  var client = new VaultAdapter(bag.vaultUrl, bag.config.rootToken);

  var params = {
    type: 'generic',
    description: 'Shippable secrets mount'
  };

  client.createMount('shippable', params,
    function (err) {
      // do not throw error if mount already exists
      if (err && err !== 400)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create mount: ' + util.inspect(err))
        );
      return next();
    }
  );
}

function _updatePolicy(bag, next) {
  var who = bag.who + '|' + _updatePolicy.name;
  logger.verbose(who, 'Inside');

  var client = new VaultAdapter(bag.vaultUrl, bag.config.rootToken);

  var policyFilePath =
    path.join(global.config.scriptsDir, 'configs/policy.hcl');

  var params = {
    policy: new Buffer(policyFilePath).toString('base64')
  };

  client.putPolicy('shippable', params,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create policy: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  // The keys have been added to bag.config
  bag.config.isInstalled = true;
  bag.config.isInitialized = true;

  configHandler.put(bag.component, bag.config,
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

function _updateVaultUrl(bag, next) {
  var who = bag.who + '|' +  _updateVaultUrl.name;
  logger.verbose(who, 'Inside');

  envHandler.put(bag.vaultUrlEnv, bag.vaultUrl,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot set env: ' + bag.vaultUrlEnv + ' err: ' + err)
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
  else
    update.isFailed = false;

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        logger.warn(err);
    }
  );
}

//local function to apply vars to template
function __applyTemplate(filePath, dataObj) {
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}
