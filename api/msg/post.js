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
    reqBody: req.body,
    resBody: [],
    params: {},
    component: 'msg',
    tmpScript: '/tmp/msg.sh'
  };

  bag.who = util.format('msg|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _initializeMsg.bind(null, bag),
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

  if (!_.has(bag.reqBody, 'password') || _.isEmpty(bag.reqBody.password))
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :password')
    );

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT %s from "systemConfigs"', bag.component);
  global.config.client.query(query,
    function (err, systemConfigs) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (!_.isEmpty(systemConfigs.rows) &&
        !_.isEmpty(systemConfigs.rows[0].msg)) {
        logger.debug('Found configuration for ' + bag.component);

        bag.config = systemConfigs.rows[0].msg;
        bag.config = JSON.parse(bag.config);
      } else {
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration present in configs for ' + bag.component)
        );
      }

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
    'MSG_HOST': global.config.admiralIP,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'IS_INITIALIZED': bag.config.isInitialized,
    'IS_INSTALLED': bag.config.isInstalled,
    'MSG_UI_USER': 'shippable',
    'MSG_UI_PASS': bag.reqBody.password,
    'MSG_USER': 'shippableRoot',
    'MSG_PASS': bag.reqBody.password,
    'RABBITMQ_ADMIN':
      path.join(global.config.scriptsDir, '/docker/rabbitmqadmin')
  };

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
  fileName = '../../common/scripts/docker/installMsg.sh';
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


function _initializeMsg(bag, next) {
  var who = bag.who + '|' + _initializeMsg.name;
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
      return next(exitCode);
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var update = bag.config;
  bag.config.isInstalled = true;
  bag.config.isInitialized = true;
  bag.config.uiUsername = bag.scriptEnvs.MSG_UI_USER;
  bag.config.uiPassword = bag.scriptEnvs.MSG_UI_PASS;
  bag.config.username = bag.scriptEnvs.MSG_USER;
  bag.config.password = bag.scriptEnvs.MSG_PASS;

  var query = util.format('UPDATE "systemConfigs" set %s=\'%s\';',
    bag.component, JSON.stringify(update));

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(
          new ActErr(who, ActErr.DataNotFound, err)
        );

      if (response.rowCount === 1) {
        logger.debug('Successfully added default value for ' + bag.component);
        bag.resBody = update;
      } else {
        logger.warn('Failed to set default value for ' + bag.component);
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
