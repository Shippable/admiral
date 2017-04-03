'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

function post(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    params: {},
    tmpScript: '/tmp/vault.sh'
  };

  bag.who = util.format('vault|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _initializeVault.bind(null, bag),
      _post.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
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

  //TODO:
  //if ip exists, then just update value in db and dont run init
  //if no object exists, initialize
  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  global.config.client.query('SELECT secrets from "systemConfigs"',
    function (err, systemConfigs) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (!_.isEmpty(systemConfigs.rows) &&
        !_.isEmpty(systemConfigs.rows[0].secrets)) {
        logger.debug('Found vault configuration');

        bag.vaultConfig = systemConfigs.rows[0].secrets;
        bag.vaultConfig = JSON.parse(bag.vaultConfig);

      } else {
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No vault configuration in database')
        );
      }

      return next();
    }
  );
}

function _generateInitializeEnvs(bag, next) {
  var who = bag.who + '|' + _generateInitializeEnvs.name;
  logger.verbose(who, 'Inside');

  //TODO:
  //gather all the variables that will be injected in init script
  //

  return next();
}

function _generateInitializeScript(bag, next) {
  var who = bag.who + '|' + _generateInitializeScript.name;
  logger.verbose(who, 'Inside');

  //attach header
  var fileName = '../../lib/_logger.sh';
  var headerScript = '';
  headerScript = headerScript.concat(__applyTemplate(fileName, bag.params));

  var initializeScript = headerScript;
  fileName = '../../common/scripts/docker/installVault.sh';
  initializeScript = headerScript.concat(__applyTemplate(fileName, bag.params));

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

  //TODO: these should come from env values
  var scriptEnvs = {
    'RUNTIME_DIR': '/var/run/shippable',
    'CONFIG_DIR': '/etc/shippable',
    'SCRIPTS_DIR': '/home/shippable/admiral/common/scripts',
    'IS_INITIALIZED': bag.vaultConfig.isInitialized,
    'IS_INSTALLED': bag.vaultConfig.isInstalled
  };

  var exec = spawn('/bin/bash',
    ['-c', bag.tmpScript],
    {
      cwd: bag.buildRootDir,
      env: scriptEnvs
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

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var update = bag.vaultConfig;
  bag.vaultConfig.isInstalled = true;
  bag.vaultConfig.isInitialized = true;

  var query = util.format('UPDATE "systemConfigs" set secrets=\'%s\';',
    JSON.stringify(update));

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (response.rowCount === 1) {
        logger.debug('Successfully added default value for vault server');
        bag.resBody = update;
      } else {
        logger.warn('Failed to set default vault server value');
      }

      return next();
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
