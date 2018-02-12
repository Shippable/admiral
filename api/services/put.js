'use strict';

var self = put;
module.exports = self;

var async = require('async');
var path = require('path');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');

var configHandler = require('../../common/configHandler.js');

function put(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: {},
    params: {},
    tmpScript: '/tmp/update_service.sh',
    isSwarmClusterInitialized: false,
    defaultServiceSettings: require(path.join(global.config.scriptsDir,
      '/configs/services.json'))
  };

  bag.who = util.format('services|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getServiceConfig.bind(null, bag),
      _getMaster.bind(null, bag),
      _getWorkers.bind(null, bag),
      _generateEnvs.bind(null, bag),
      _generateScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _updateService.bind(null, bag),
      _put.bind(null, bag),
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

  if (!bag.inputParams.serviceName)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Data not found :serviceName')
    );
  bag.name = bag.inputParams.serviceName;

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  if (!_.isString(bag.reqBody.replicas) && !_.isNumber(bag.reqBody.replicas))
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Data not found :replicas')
    );

  bag.replicas = bag.reqBody.replicas;

  return next();
}

function _getServiceConfig(bag, next) {
  var who = bag.who + '|' + _getServiceConfig.name;
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
            'Failed to get workers', err)
        );

      if (_.isEmpty(workers))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for workers')
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

function _generateEnvs(bag, next) {
  var who = bag.who + '|' + _generateEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'RUNTIME_DIR': global.config.runtimeDir,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'SERVICE_NAME': bag.serviceConfig.serviceName,
    'SERVICE_IMAGE': bag.serviceConfig.image,
    'IS_SWARM_INITIALIZED': bag.isSwarmClusterInitialized,
    'REPLICAS': bag.replicas
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

  filePath = path.join(global.config.scriptsDir, 'update_service.sh');
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

function _updateService(bag, next) {
  var who = bag.who + '|' + _updateService.name;
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

function _put(bag, next) {
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  bag.serviceConfig.replicas = bag.replicas;

  var serviceConf = _.findWhere(bag.defaultServiceSettings.serviceConfigs,
    {name: bag.name});

  if (_.isEmpty(serviceConf))
    return next(
      new ActErr(who, ActErr.OperationFailed,
        util.format('unable to fetch service configuration from services.json' +
          ' for service name: %s', bag.name))
    );

  var defaultApiUrlIntegration = serviceConf.apiUrlIntegration;

  //bag.reqBody.apiUrlIntegration is added to add support for dynamically
  //picking up apiUrlIntegration from the UI in the future
  bag.serviceConfig.apiUrlIntegration = bag.reqBody.apiUrlIntegration ||
    bag.serviceConfig.apiUrlIntegration || defaultApiUrlIntegration;

  if (_.has(bag.reqBody, 'isEnabled'))
    bag.serviceConfig.isEnabled = bag.reqBody.isEnabled;

  bag.services[bag.name] = bag.serviceConfig;

  configHandler.put('services', bag.services,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update services config', err)
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
