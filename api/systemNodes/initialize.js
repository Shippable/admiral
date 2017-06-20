'use strict';

var self = initialize;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');

var APIAdapter = require('../../common/APIAdapter.js');

var genexecConfig = require('./genexecConfig.js');

function initialize(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    systemNodeId: null,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    tmpScript: '/tmp/service.sh'
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemSettings.bind(null, bag),
      _getSystemNode.bind(null, bag),
      _getSystemNodeRoleCode.bind(null, bag),
      _generateGenexecConfig.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _bootService.bind(null, bag)
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

  if (!bag.reqBody.id)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :id')
    );
  bag.systemNodeId = bag.reqBody.id;

  if (!bag.reqBody.execImage)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :execImage')
    );
  bag.execImage = bag.reqBody.execImage;

  if (global.config.admiralIP !== 'localhost' &&
    global.config.admiralIP !== '127.0.0.1')
    return next(
      new ActErr(who, ActErr.OperationFailed, 'Unable to bring up system node')
    );

  return next();
}

function _getSystemSettings(bag, next) {
  var who = bag.who + '|' + _getSystemSettings.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemSettings('',
    function (err, systemSettings) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system settings : ' + util.inspect(err))
        );

      if (systemSettings.runMode !== 'dev')
        return next(
          new ActErr(who, ActErr.OperationFailed, util.format('Unable to ' +
            'POST system node on run mode: %s', systemSettings.runMode))
        );

      bag.runMode = systemSettings.runMode;

      return next();
    }
  );
}

function _getSystemNode(bag, next) {
  var who = bag.who + '|' + _getSystemNode.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemNodes" WHERE id=\'%s\'',
    bag.systemNodeId);

  global.config.client.query(query,
    function (err, systemNodes) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemNode with error: ' + util.inspect(err))
        );

      if (_.isEmpty(systemNodes.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemNode not found for id: ' + bag.systemNodeId)
        );

      return next();
    }
  );
}

function _getSystemNodeRoleCode(bag, next) {
  var who = bag.who + '|' + _getSystemNodeRoleCode.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "code" FROM "systemCodes" WHERE '+
    '"group"=\'nodeType\' AND "name"=\'system\'';

  global.config.client.query(query,
    function (err, result) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to fetch systemNode roleCode', err)
        );

      if (_.isEmpty(result.rows) || !result.rows[0].code)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No code found for group: nodeType and name: system')
        );
      bag.systemNodeRoleCode = result.rows[0].code;
      logger.debug('systemNode role code is: ' + bag.systemNodeRoleCode);
      return next();
    }
  );
}

function _generateGenexecConfig(bag, next) {
  var who = bag.who + '|' + _generateGenexecConfig.name;
  logger.verbose(who, 'Inside');

  bag.serviceConfig = {
    image: bag.execImage,
    listenQueue: 'systemNodes.exec',
    nodeId: bag.systemNodeId,
    nodeTypeCode: bag.systemNodeRoleCode,
    runMode: bag.runMode
  };

  var params = {
    apiAdapter: bag.apiAdapter,
    config: bag.serviceConfig,
    name: 'genExec'
  };

  genexecConfig(params,
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

function _generateInitializeEnvs(bag, next) {
  var who = bag.who + '|' + _generateInitializeEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'RUNTIME_DIR': global.config.runtimeDir,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'SERVICE_NAME': bag.serviceConfig.serviceName,
    'SERVICE_IMAGE': bag.serviceConfig.image,
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

//local function to apply vars to template
function __applyTemplate(filePath, dataObj) {
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}
