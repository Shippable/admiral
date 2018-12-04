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
    reqBody: req.body,
    resBody: [],
    res: res,
    params: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    skipStatusChange: false,
    isResponseSent: false,
    component: 'secrets',
    tmpScript: '/tmp/secrets.sh',
    vaultUrlEnv: 'VAULT_URL',
    vaultTokenEnv: 'VAULT_TOKEN'
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
      _getOperatingSystem.bind(null, bag),
      _getArchitecture.bind(null, bag),
      _getDevMode.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _installVault.bind(null, bag),
      _getVaultToken.bind(null, bag),
      _getVaultUnsealKeys.bind(null, bag),
      _checkInitStatus.bind(null, bag),
      _initialize.bind(null, bag),
      _saveUnsealKeys.bind(null, bag),
      _setVaultRootToken.bind(null, bag),
      _unsealVaultStep1.bind(null, bag),
      _unsealVaultStep2.bind(null, bag),
      _unsealVaultStep3.bind(null, bag),
      _createSecretsMount.bind(null, bag),
      _updatePolicy.bind(null, bag),
      _checkCredentials.bind(null, bag),
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

function _getOperatingSystem(bag, next) {
  var who = bag.who + '|' + _getOperatingSystem.name;
  logger.verbose(who, 'Inside');

  envHandler.get('OPERATING_SYSTEM',
    function (err, operatingSystem) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: OPERATING_SYSTEM')
        );

      bag.operatingSystem = operatingSystem;
      logger.debug('Found Operating System');

      return next();
    }
  );
}

function _getArchitecture(bag, next) {
  var who = bag.who + '|' + _getArchitecture.name;
  logger.verbose(who, 'Inside');

  envHandler.get('ARCHITECTURE',
    function (err, architecture) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ARCHITECTURE')
        );

      bag.architecture = architecture;
      logger.debug('Found Architecture');

      return next();
    }
  );
}

function _getDevMode(bag, next) {
  var who = bag.who + '|' + _getDevMode.name;
  logger.verbose(who, 'Inside');

  envHandler.get('DEV_MODE',
    function (err, devMode) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: DEV_MODE')
        );
      bag.devMode = devMode;
      logger.debug('Found dev mode');

      return next();
    }
  );
}

function _generateInitializeEnvs(bag, next) {
  if (!bag.config.isShippableManaged) return next();

  var who = bag.who + '|' + _generateInitializeEnvs.name;
  logger.verbose(who, 'Inside');

  /* jshint camelcase: false */
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
    'VAULT_PORT': bag.config.port,
    'SHIPPABLE_HTTP_PROXY': process.env.http_proxy || '',
    'SHIPPABLE_HTTPS_PROXY': process.env.https_proxy || '',
    'SHIPPABLE_NO_PROXY': process.env.no_proxy || '',
    'ARCHITECTURE': bag.architecture,
    'OPERATING_SYSTEM': bag.operatingSystem,
    'DEV_MODE': bag.devMode
  };
  /* jshint camelcase: true */

  return next();
}

function _generateInitializeScript(bag, next) {
  if (!bag.config.isShippableManaged) return next();

  var who = bag.who + '|' + _generateInitializeScript.name;
  logger.verbose(who, 'Inside');

  //attach header
  var filePath = path.join(global.config.scriptsDir, '/lib/_logger.sh');
  var headerScript = '';
  headerScript = headerScript.concat(__applyTemplate(filePath, bag.params));

  var helpers = headerScript;
  filePath = path.join(global.config.scriptsDir, '/lib/_helpers.sh');
  helpers = headerScript.concat(__applyTemplate(filePath, bag.params));

  var osArchitectureHelpers = helpers;
  filePath = path.join(global.config.scriptsDir, bag.architecture,
    bag.operatingSystem, '_helpers.sh');
  osArchitectureHelpers =
    osArchitectureHelpers.concat(__applyTemplate(filePath, bag.params));

  var initializeScript = osArchitectureHelpers;
  filePath = path.join(global.config.scriptsDir, 'installVault.sh');
  initializeScript =
    initializeScript.concat(__applyTemplate(filePath, bag.params));

  bag.script = initializeScript;
  return next();
}

function _writeScriptToFile(bag, next) {
  if (!bag.config.isShippableManaged) return next();

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
  if (!bag.config.isShippableManaged) return next();

  var who = bag.who + '|' + _installVault.name;
  logger.verbose(who, 'Inside');

  /* jshint camelcase:false */
  bag.scriptEnvs = bag.scriptEnvs || {};
  if (process.env.http_proxy)
    bag.scriptEnvs.http_proxy = process.env.http_proxy;

  if (process.env.https_proxy)
    bag.scriptEnvs.https_proxy = process.env.https_proxy;

  if (process.env.no_proxy)
    bag.scriptEnvs.no_proxy = process.env.no_proxy;
  /* jshint camelcase:true */

  var exec = spawn('/bin/bash',
    ['-c', bag.tmpScript],
    {
      env: bag.scriptEnvs
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
            'Script returned code: ' + exitCode)
        );
      return next();
    }
  );
}

function _getVaultToken(bag, next) {
  var who = bag.who + '|' + _getVaultToken.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.vaultTokenEnv,
    function (err, token) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.vaultTokenEnv)
        );

      if (!_.isEmpty(token))
        bag.rootToken = token;

      return next();
    }
  );
}

function _getVaultUnsealKeys(bag, next) {
  var who = bag.who + '|' + _getVaultUnsealKeys.name;
  logger.verbose(who, 'Inside');

  async.timesSeries(5,
    function (number, done) {
      var index = number + 1;
      envHandler.get('VAULT_UNSEAL_KEY' + index,
        function (err, key) {
          if (err)
            return done(
              new ActErr(who, ActErr.OperationFailed,
                'Cannot get env: ' + 'VAULT_UNSEAL_KEY' + index)
            );

          bag['unsealKey' + index] = key;
          return done();
        }
      );
    },
    function (err) {
      return next(err);
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

      //"initialized" means that vault keys and root token have been generated.
      //This is equivalent of running "vault init" command from cli.
      //"initialized" status does NOT mean vault is ready to serve requests.
      //Vault needs to be unsealed before it can do that.
      if (response.initialized === true) {
        logger.debug('Vault already initialized');

        //we're not checking availablity of 5 unseal keys because it should be
        //optional for the user to keep all the unseal keys in admiral.env
        if (_.isEmpty(bag.rootToken))
          return next(
            new ActErr(who, ActErr.OperationFailed,
              'Vault is missing a root token.')
          );

        // 'isInitialized' flag stores vault status as defined by shippable
        // 'isVaultInitialized' flag implies whether vault server has been
        // initialized or not.
        bag.isVaultInitialized = response.initialized;
      } else {
        bag.isVaultInitialized = false;
      }
      return next();
    }
  );
}

function _initialize(bag, next) {
  if (!bag.config.isShippableManaged) return next();

  // skip if vault already initialized
  if (bag.isVaultInitialized) return next();

  var who = bag.who + '|' + _initialize.name;
  logger.verbose(who, 'Inside');

  var client = new VaultAdapter(bag.vaultUrl);
  var params = {
    /* jshint camelcase:false */
    secret_shares: 5,
    secret_threshold: 3
    /* jshint camelcase:true */
  };
  client.init(params,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to initialize vault: ' + util.inspect(err))
        );
      bag.unsealKey1 = response.keys[0];
      bag.unsealKey2 = response.keys[1];
      bag.unsealKey3 = response.keys[2];
      bag.unsealKey4 = response.keys[3];
      bag.unsealKey5 = response.keys[4];
      /* jshint camelcase:false */
      bag.rootToken  = response.root_token;
      /* jshint camelcase:true */

      bag.isVaultInitialized = true;
      logger.debug('Successfully fetched unseal keys for vault');
      return next();
    }
  );
}

function _saveUnsealKeys(bag, next) {
  // unseal keys might not be present for server installation
  if (!bag.config.isShippableManaged) return next();

  // keys should already be saved if initialized is true
  if (bag.config.isInitialized) return next();

  var who = bag.who + '|' + _saveUnsealKeys.name;
  logger.verbose(who, 'Inside');

  async.timesSeries(5,
    function (number, done) {
      var index = number + 1;
      envHandler.put('VAULT_UNSEAL_KEY' + index, bag['unsealKey' + index],
        function (err) {
          if (err)
            return done(
              new ActErr(who, ActErr.OperationFailed,
                'Failed to set ' + 'VAULT_UNSEAL_KEY' + index +
                ' with error: ' + err)
            );

          return done();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _setVaultRootToken(bag, next) {
  // root token should already be saved if initialised is true
  if (bag.config.isInitialized && bag.config.isShippableManaged) return next();

  var who = bag.who + '|' + _setVaultRootToken.name;
  logger.verbose(who, 'Inside');

  envHandler.put('VAULT_TOKEN', bag.rootToken,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to set VAULT_TOKEN with error: ' + err)
        );

      return next();
    }
  );
}

function _unsealVaultStep1(bag, next) {
  if (!bag.config.isShippableManaged) return next();
  // cannot unseal if vault is not initialized
  if (!bag.isVaultInitialized) return next();

  // do not  unseal if key is not present
  if (_.isEmpty(bag.unsealKey1)) return next();

  var who = bag.who + '|' + _unsealVaultStep1.name;
  logger.verbose(who, 'Inside');

  var client = new VaultAdapter(bag.vaultUrl);

  var params = {
    /* jshint camelcase:false */
    secret_shares: 3,
    /* jshint camelcase:true */
    key: bag.unsealKey1
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
  if (!bag.config.isShippableManaged) return next();
  // cannot unseal if vault is not initialized
  if (!bag.isVaultInitialized) return next();

  // do not  unseal if key is not present
  if (_.isEmpty(bag.unsealKey1)) return next();

  var who = bag.who + '|' + _unsealVaultStep2.name;
  logger.verbose(who, 'Inside');

  var params = {
    /* jshint camelcase:false */
    secret_shares: 3,
    /* jshint camelcase:true */
    key: bag.unsealKey2
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
  if (!bag.config.isShippableManaged) return next();
  // cannot unseal if vault is not initialized
  if (!bag.isVaultInitialized) return next();

  // do not  unseal if key is not present
  if (_.isEmpty(bag.unsealKey1)) return next();

  var who = bag.who + '|' + _unsealVaultStep3.name;
  logger.verbose(who, 'Inside');
  var params = {
    /* jshint camelcase:false */
    secret_shares: 3,
    /* jshint camelcase:true */
    key: bag.unsealKey3
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

  var client = new VaultAdapter(bag.vaultUrl, bag.rootToken);

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

  var client = new VaultAdapter(bag.vaultUrl, bag.rootToken);

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

function _checkCredentials(bag, next) {
  if (bag.config.isShippableManaged) return next();

  var who = bag.who + '|' + _checkCredentials.name;
  logger.verbose(who, 'Inside');

  var seriesBag = {
    who: who,
    client: new VaultAdapter(bag.vaultUrl, bag.rootToken),
    testKey: 'shippable/testPermissions',
    testSecret: {
      testValue: 'testSecret'
    }
  };

  async.series([
      _postSecret.bind(null, seriesBag),
      _getSecret.bind(null, seriesBag),
      _deleteSecret.bind(null, seriesBag)
    ],
    function (err) {
      if (err)
        return next(err);

      return next(err);
    }
  );
}

function _postSecret(seriesBag, next) {
  var who = seriesBag.who + '|' + _postSecret.name;
  logger.debug(who, 'Inside');

  seriesBag.client.postSecret(seriesBag.testKey, seriesBag.testSecret,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to :postSecret with error ' + err + util.inspect(body))
        );

      return next();
    }
  );
}

function _getSecret(seriesBag, next) {
  var who = seriesBag.who + '|' + _getSecret.name;
  logger.debug(who, 'Inside');

  seriesBag.client.getSecret(seriesBag.testKey,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to :getSecret with error ' + err + ' ' + util.inspect(body))
        );

      if (seriesBag.testSecret.testValue !== body.data.testValue)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Wrong value found getting ' + seriesBag.testKey + ' from vault')
        );

      return next();
    }
  );
}

function _deleteSecret(seriesBag, next) {
  var who = seriesBag.who + '|' + _deleteSecret.name;
  logger.verbose(who, 'Inside');

  seriesBag.client.deleteSecret(seriesBag.testKey,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to :deleteSecret ' + seriesBag.testKey +
            ' with error ' + err + ' ' + util.inspect(body))
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
