'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var APIAdapter = require('../../common/APIAdapter.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: [],
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    params: {},
    component: 'state',
    tmpScript: '/tmp/state.sh'
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _initializeState.bind(null, bag),
      _postSystemIntegration.bind(null, bag),
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
        !_.isEmpty(systemConfigs.rows[0].state)) {
        logger.debug('Found configuration for ' + bag.component);

        bag.config = systemConfigs.rows[0].state;
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
    'STATE_HOST': global.config.admiralIP,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'IS_INITIALIZED': bag.config.isInitialized,
    'IS_INSTALLED': bag.config.isInstalled,
    'STATE_PASS': bag.reqBody.password
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
  fileName = '../../common/scripts/docker/installState.sh';
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


function _initializeState(bag, next) {
  var who = bag.who + '|' + _initializeState.name;
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

function _postSystemIntegration(bag, next) {
  var who = bag.who + '|' + _postSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var postObject = {
    name: 'gitlabCreds',
    masterName: 'gitlabCreds',
    data: {
      username: 'root',
      password: bag.scriptEnvs.STATE_PASS,
      url: util.format('http://%s/api/v3', bag.scriptEnvs.STATE_HOST)
    }
  };

  bag.apiAdapter.postSystemIntegration(postObject,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to create system integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var update = bag.config;
  bag.config.isInstalled = true;
  bag.config.isInitialized = true;
  bag.config.rootPassword = bag.reqBody.password;

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
