'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;

var envHandler = require('../../common/envHandler.js');
var configHandler = require('../../common/configHandler.js');

function post(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    params: {},
    skipStatusChange: false,
    component: 'secrets',
    tmpScript: '/tmp/secrets.sh'
  };

  bag.who = util.format('secrets|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _initializeVault.bind(null, bag),
      _getUnsealKeys.bind(null, bag),
      _getVaultRootToken.bind(null, bag),
      _post.bind(null, bag),
      _updateVaultUrl.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (!bag.skipStatusChange)
        _setCompleteStatus(bag, err);

      if (err)
        return respondWithError(res, err);

      //TODO: remove tmp file
      sendJSONResponse(res, bag.resBody);
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
          new ActErr(who, ActErr.DataNotFound, err)
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
          new ActErr(who, ActErr.OperationFailed, err)
        );

      return next();
    }
  );
}

function _generateInitializeEnvs(bag, next) {
  var who = bag.who + '|' + _generateInitializeEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'RUNTIME_DIR': global.config.runtimeDir,
    'CONFIG_DIR': global.config.configDir,
    'RELEASE': global.config.release,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'IS_INITIALIZED': bag.config.isInitialized,
    'IS_INSTALLED': bag.config.isInstalled,
    'DBUSERNAME': global.config.dbUsername,
    'DBPASSWORD': global.config.dbPassword,
    'DBHOST': global.config.dbHost,
    'DBPORT': global.config.dbPort,
    'DBNAME': global.config.dbName,
    'VAULT_HOST': global.config.admiralIP,
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

  var initializeScript = headerScript;
  filePath = path.join(global.config.scriptsDir, 'docker/installVault.sh');
  initializeScript = headerScript.concat(__applyTemplate(filePath, bag.params));

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


function _initializeVault(bag, next) {
  var who = bag.who + '|' + _initializeVault.name;
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

function _getUnsealKeys(bag, next) {
  var who = bag.who + '|' + _getUnsealKeys.name;
  logger.verbose(who, 'Inside');

  var keyIndex = 1;
  var unsealKeysFile = path.join(
    global.config.configDir, bag.component, 'scripts/keys.txt');

  var filereader = readline.createInterface({
    input: fs.createReadStream(unsealKeysFile),
    console: false
  });

  filereader.on('line',
    function (line) {
      // this is the format in which unseal keys are stored
      var keyString = util.format('Unseal Key %s:', keyIndex);
      if (!_.isEmpty(line) && line.indexOf(keyString) >= 0) {
        var value = line.split(' ')[3];
        var keyNameInConfig = 'unsealKey' + keyIndex;

        // set the unseal key in config object
        bag.config[keyNameInConfig] = value;

        // parse next key
        keyIndex ++;
      }
    }
  );

  filereader.on('close',
    function () {
      return next(null);
    }
  );
}

function _getVaultRootToken(bag, next) {
  var who = bag.who + '|' + _getVaultRootToken.name;
  logger.verbose(who, 'Inside');

  envHandler.get('VAULT_TOKEN',
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, err)
        );

      if (_.isEmpty(value))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'empty VAULT_TOKEN in admiral.env')
        );

      bag.config.rootToken = value;
      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var update = {
    isInstalled: true,
    isInitialized: true
  };

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, err)
        );

      return next();
    }
  );
}

function _updateVaultUrl(bag, next) {
  var who = bag.who + '|' +  _updateVaultUrl.name;
  logger.verbose(who, 'Inside');

  var query = util.format('UPDATE "systemConfigs" set "vaultUrl"=\'%s\';',
    bag.config.address);

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (response.rowCount === 1) {
        logger.debug('Successfully added default value for vault url');
      } else {
        logger.warn('Failed to set default vault url');
      }

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
