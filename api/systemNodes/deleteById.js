'use strict';

var self = deleteById;
module.exports = self;

var async = require('async');
var path = require('path');
var _ = require('underscore');
var spawn = require('child_process').spawn;
var fs = require('fs');

function deleteById(req, res) {
  var bag = {
    systemNodeId: null,
    systemNode: {},
    inputParams: req.params,
    resBody: {},
    tmpScript: '/tmp/delete_service.sh'
  };

  bag.who = util.format('systemNodes|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemNode.bind(null, bag),
      _getStoppedRoleCode.bind(null, bag),
      _updateSystemNode.bind(null, bag),
      _generateDeleteEnvs.bind(null, bag),
      _generateScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _deleteService.bind(null, bag),
      _deleteSystemNodeConsoles.bind(null, bag),
      _deleteSystemNodeStats.bind(null, bag),
      _deleteSystemNode.bind(null, bag)
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

  if (!bag.inputParams.systemNodeId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route param not found :systemNodeId')
    );

  bag.systemNodeId = bag.inputParams.systemNodeId;

  return next();
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

      logger.debug('Found systemNode ' + bag.systemNodeId);

      bag.systemNode = _.first(systemNodes.rows);
      return next();
    }
  );
}

function _getStoppedRoleCode(bag, next) {
  var who = bag.who + '|' + _getStoppedRoleCode.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "code" FROM "systemCodes" WHERE '+
    '"group"=\'statusCodes\' AND "name"=\'STOPPED\'';

  global.config.client.query(query,
    function (err, result) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to fetch STOPPED roleCode', err)
        );

      if (_.isEmpty(result.rows) || !result.rows[0].code)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No code found for group: statusCodes and name: STOPPED')
        );
      bag.stoppedRoleCode = _.first(result.rows).code;
      logger.debug('STOPPED role code is: ' + bag.stoppedRoleCode);
      return next();
    }
  );
}

// stopping system node, so that it doesn't pick up builds
function _updateSystemNode(bag, next) {
  if (bag.systemNode.statusCode === bag.stoppedRoleCode) return next();

  var who = bag.who + '|' + _updateSystemNode.name;
  logger.verbose(who, 'Inside');

  var query = util.format('UPDATE "systemNodes" set "statusCode"  = \'%s\' '+
    'WHERE id = \'%s\'', bag.stoppedRoleCode, bag.systemNode.id);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            util.format('Failed to update systemNode with id: %s with STOPPED' +
            ' statusCode with err: %s', bag.systemNode.id, err))
        );

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
    'SERVICE_NAME': 'shippable-exec-' + bag.systemNode.id,
    'SERVICE_IMAGE': bag.systemNode.execImage
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

function _deleteSystemNodeStats(bag, next) {
  var who = bag.who + '|' + _deleteSystemNodeStats.name;
  logger.verbose(who, 'Inside');

  var query = util.format('DELETE FROM "systemNodeStats" WHERE '+
    '"systemNodeId"=\'%s\'', bag.systemNode.id);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            util.format('Failed to delete systemNodeStats for '+
            'systemNodeId: %s with error: ', bag.systemNode.id,
            util.inspect(err)))
        );

      return next();
    }
  );
}

function _deleteSystemNodeConsoles(bag, next) {
  var who = bag.who + '|' + _deleteSystemNodeConsoles.name;
  logger.verbose(who, 'Inside');

  var query = util.format('DELETE FROM "systemNodeConsoles" WHERE '+
    '"systemNodeId"=\'%s\'', bag.systemNode.id);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            util.format('Failed to delete systemNodeConsoles for '+
            'systemNodeId: %s with error: ', bag.systemNode.id,
            util.inspect(err)))
        );

      return next();
    }
  );
}

function _deleteSystemNode(bag, next) {
  var who = bag.who + '|' + _deleteSystemNode.name;
  logger.verbose(who, 'Inside');

  var query = util.format('DELETE FROM "systemNodes" WHERE id=\'%s\'',
    bag.systemNode.id);

  global.config.client.query(query,
    function (err, systemNode) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            util.format('Failed to delete systemNode with id: %s with error:' +
            ' %s', bag.systemNode.id, util.inspect(err)))
        );

      if (systemNode.rowCount === 1)
        bag.resBody.id = bag.systemNode.id;
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
