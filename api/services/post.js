'use strict';

var self = post;
module.exports = self;

var async = require('async');
var path = require('path');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');

var APIAdapter = require('../../common/APIAdapter.js');
var envHandler = require('../../common/envHandler.js');
var configHandler = require('../../common/configHandler.js');

var apiConfig = require('./apiConfig.js');
var wwwConfig = require('./wwwConfig.js');
var mktgConfig = require('./mktgConfig.js');
var nexecConfig = require('./nexecConfig.js');
var microConfig = require('./microConfig.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    params: {},
    tmpScript: '/tmp/service.sh',
    accessKeyEnv: 'ACCESS_KEY',
    secretKeyEnv: 'SECRET_KEY',
    registryEnv: 'PRIVATE_IMAGE_REGISTRY',
    publicRegistryEnv: 'PUBLIC_IMAGE_REGISTRY'
  };

  bag.who = util.format('services|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getReleaseVersion.bind(null, bag),
      _getServiceConfig.bind(null, bag),
      _getMaster.bind(null, bag),
      _getWorkers.bind(null, bag),
      _getAccessKey.bind(null, bag),
      _getSecretKey.bind(null, bag),
      _getRegistry.bind(null, bag),
      _getPublicRegistry.bind(null, bag),
      _generateServiceConfig.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _bootService.bind(null, bag),
      _post.bind(null, bag),
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

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  if (_.isEmpty(bag.reqBody.name))
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Data not found :name')
    );
  bag.name = bag.reqBody.name;

  if (!_.isString(bag.reqBody.replicas) && !_.isNumber(bag.reqBody.replicas))
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Data not found :replicas')
    );

  bag.replicas = bag.reqBody.replicas;

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

function _getServiceConfig(bag, next) {
  var who = bag.who + '|' + _generateServiceConfig.name;
  logger.verbose(who, 'Inside');

  configHandler.get('services',
    function (err, config) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get services', err)
        );

      if (_.isEmpty(config))
        return next(
          new ActErr(who, ActErr.DataNotFound, 'No service configs present'));

      if (!_.has(config, bag.name))
        return next(
          new ActErr(who, ActErr.DataNotFound, 'No service configs present ' +
          ' for :' + bag.name)
        );

      bag.services = config;
      bag.serviceConfig = config[bag.name];
      return next();
    }
  );
}

function _getMaster(bag, next) {
  var who = bag.who + '|' + _getMaster.name;
  logger.verbose(who, 'Inside');

  configHandler.get('master',
    function (err, master) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get master', err)
        );

      if (_.isEmpty(master))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for master')
        );

      bag.master = master;
      return next();
    }
  );
}

function _getWorkers(bag, next) {
  var who = bag.who + '|' + _getWorkers.name;
  logger.verbose(who, 'Inside');

  configHandler.get('workers',
    function (err, workers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(workers))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );
      // if even one worker has external IP then swarm cluster is initialized
      bag.isSwarmClusterInitialized = _.some(workers,
        function (worker) {
          return worker.address !== bag.master.address;
        }
      );
      return next();
    }
  );
}

function _getRegistry(bag, next) {
  var who = bag.who + '|' + _getRegistry.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.registryEnv,
    function (err, registry) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.registryEnv)
        );

      bag.registry = registry;
      logger.debug('Found registry');

      return next();
    }
  );
}

function _getPublicRegistry(bag, next) {
  var who = bag.who + '|' + _getPublicRegistry.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.publicRegistryEnv,
    function (err, pubRegistry) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.publicRegistryEnv)
        );

      bag.publicRegistry = pubRegistry;
      logger.debug('Found public registry');

      return next();
    }
  );
}

function _generateServiceConfig(bag, next) {
  var who = bag.who + '|' + _generateServiceConfig.name;
  logger.verbose(who, 'Inside');

  var configGenerator = null;
  if (bag.name === 'api')
    configGenerator = apiConfig;
  else if (bag.name === 'www')
    configGenerator = wwwConfig;
  else if (bag.name === 'mktg')
    configGenerator = mktgConfig;
  else if (bag.name === 'nexec')
    configGenerator = nexecConfig;
  else
    configGenerator = microConfig;

  var params = {
    apiAdapter: bag.apiAdapter,
    config: bag.serviceConfig,
    name: bag.name,
    registry: bag.registry,
    releaseVersion: bag.releaseVersion,
    isSwarmClusterInitialized: bag.isSwarmClusterInitialized,
    publicRegistry: bag.publicRegistry
  };

  if (!configGenerator)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'No config generator for service: ' + bag.name)
    );

  configGenerator(params,
    function (err, config, runCommand) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to generate config for service: ' + params.name +
            ' with error: ' + err.message)
        );

      bag.serviceConfig = config;
      bag.runCommand = runCommand;
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

function _generateInitializeEnvs(bag, next) {
  var who = bag.who + '|' + _generateInitializeEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'RUNTIME_DIR': global.config.runtimeDir,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'SERVICE_NAME': bag.serviceConfig.serviceName,
    'SERVICE_IMAGE': bag.serviceConfig.image,
    'ACCESS_KEY': bag.accessKey,
    'SECRET_KEY': bag.secretKey,
    'RUN_COMMAND': bag.runCommand
  };

  return next();
}

function _generateScript(bag, next) {
  var who = bag.who + '|' + _generateScript.name;
  logger.verbose(who, 'Inside');

  var script = '';
  //attach header
  var filePath = path.join(global.config.scriptsDir, '/lib/_logger.sh');
  script = script.concat(__applyTemplate(filePath, bag.params));

  filePath = path.join(global.config.scriptsDir, 'boot_service.sh');
  script = script.concat(__applyTemplate(filePath, bag.params));

  bag.script = script;
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

function _bootService(bag, next) {
  var who = bag.who + '|' + _bootService.name;
  logger.verbose(who, 'Inside');

  var exec = spawn('/bin/bash',
    ['-c', bag.script],
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

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  bag.serviceConfig.isEnabled = true;
  bag.services[bag.name] = bag.serviceConfig;

  configHandler.put('services', bag.services,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to uodate services config', err)
        );

      bag.resBody = bag.serviceConfig;
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
