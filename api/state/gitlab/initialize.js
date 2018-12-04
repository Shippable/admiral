'use strict';

var self = initialize;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var envHandler = require('../../../common/envHandler.js');

function initialize(params, callback) {
  var bag = {
    config: params.config,
    systemIntegration: params.systemIntegration,
    releaseVersion: params.releaseVersion,
    params: {},
    tmpScript: '/tmp/state.sh'
  };

  bag.who = util.format('state|gitlab|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getOperatingSystem.bind(null, bag),
      _getArchitecture.bind(null, bag),
      _getDevMode.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _initializeState.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return callback(err);

      return callback();
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

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
    'ADMIRAL_IP': global.config.admiralIP,
    'SSH_USER': global.config.sshUser,
    'SSH_PRIVATE_KEY': path.join(global.config.configDir, 'machinekey'),
    'SSH_PUBLIC_KEY': path.join(global.config.configDir, 'machinekey.pub'),
    'STATE_HOST': bag.config.address,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'IS_INITIALIZED': bag.config.isInitialized,
    'IS_INSTALLED': bag.config.isInstalled,
    'STATE_PASS': bag.systemIntegration.data.password,
    'STATE_PORT': bag.config.port,
    'SSH_PORT': bag.config.sshPort,
    'SECURE_PORT': bag.config.securePort,
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
  filePath = path.join(global.config.scriptsDir, 'installState.sh');
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

function _initializeState(bag, next) {
  if (!bag.config.isShippableManaged) return next();

  var who = bag.who + '|' + _initializeState.name;
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

//local function to apply vars to template
function __applyTemplate(filePath, dataObj) {
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}
