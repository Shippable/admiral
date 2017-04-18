'use strict';

var self = post;
module.exports = self;

var async = require('async');
var path = require('path');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');

var configHandler = require('../../common/configHandler.js');

var apiConfig = require('./apiConfig.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    params: {},
    tmpScript: '/tmp/service.sh'
  };

  bag.who = util.format('services|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getServiceConfig.bind(null, bag),
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

  if (_.isEmpty(bag.reqBody.replicas))
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Data not found :replicas')
    );

  bag.replicas = bag.reqBody.replicas;

  return next();
}

function _getServiceConfig(bag, next) {
  var who = bag.who + '|' + _generateServiceConfig.name;
  logger.verbose(who, 'Inside');

  configHandler.get('services',
    function (err, config) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, err)
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

function _generateServiceConfig(bag, next) {
  var who = bag.who + '|' + _generateServiceConfig.name;
  logger.verbose(who, 'Inside');

  var configGenerator = null;
  if (bag.name === 'api')
    configGenerator = apiConfig;

  var params = {
    config: bag.serviceConfig,
    name: bag.name
  };

  configGenerator(params,
    function (err, config) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to generate config for service: ' + params.name)
        );

      bag.serviceConfig = config;
      return next();
    }
  );
}

function _generateInitializeEnvs(bag, next) {
  var who = bag.who + '|' + _generateInitializeEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'RUNTIME_DIR': global.config.runtimeDir,
    'SERVICE_NAME': bag.serviceConfig.serviceName,
    'SERVICE_IMAGE': bag.serviceConfig.image,
    'SERVICE_ENV': bag.serviceConfig.env,
    'SERVICE_OPTS': bag.serviceConfig.opts,
    'SERVICE_MOUNTS': bag.serviceConfig.mounts
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

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  bag.services[bag.name] = bag.serviceConfig;

  configHandler.put('services', bag.services,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed, err)
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
