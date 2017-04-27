'use strict';

var self = deleteByName;
module.exports = self;

var async = require('async');
var path = require('path');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');

var APIAdapter = require('../../common/APIAdapter.js');
var configHandler = require('../../common/configHandler.js');

function deleteByName(req, res) {
  var bag = {
    inputParams: req.params,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    params: {},
    tmpScript: '/tmp/delete_service.sh'
  };

  bag.who = util.format('services|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getServiceConfig.bind(null, bag),
      _generateDeleteEnvs.bind(null, bag),
      _generateScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _deleteService.bind(null, bag),
      _delete.bind(null, bag),
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

function _generateDeleteEnvs(bag, next) {
  var who = bag.who + '|' + _generateDeleteEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'RUNTIME_DIR': global.config.runtimeDir,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'SERVICE_NAME': bag.serviceConfig.serviceName,
    'SERVICE_IMAGE': bag.serviceConfig.image
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

  filePath = path.join(global.config.scriptsDir, 'delete_service.sh');
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

function _deleteService(bag, next) {
  var who = bag.who + '|' + _deleteService.name;
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

function _delete(bag, next) {
  var who = bag.who + '|' + _delete.name;
  logger.verbose(who, 'Inside');

  bag.serviceConfig.isEnabled = false;
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
