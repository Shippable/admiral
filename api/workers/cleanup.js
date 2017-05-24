'use strict';

var self = cleanup;
module.exports = self;

var async = require('async');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var spawn = require('child_process').spawn;

var configHandler = require('../../common/configHandler.js');
var envHandler = require('../../common/envHandler.js');
var APIAdapter = require('../../common/APIAdapter.js');

function cleanup(req, res) {
  var bag = {
    resBody: {},
    reqBody: req.body,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    component: 'workers',
    tmpScript: '/tmp/workers.sh',
    config: {}
  };

  bag.who = util.format('workers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _getReleaseVersion.bind(null, bag),
      _getPublicImageRegistry.bind(null, bag),
      _getPrivateImageRegistry.bind(null, bag),
      _generateEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _cleanupWorker.bind(null, bag)
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

  if (!_.has(bag.reqBody, 'address') || _.isEmpty(bag.reqBody.address))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data :address')
    );

  bag.address = bag.reqBody.address;

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
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

      bag.config = _.find(workers,
        function (worker) {
          return worker.address === bag.address;
        }
      );

      if (_.isEmpty(bag.config))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No entry in workers list for ' + bag.address)
        );
      return next();
    }
  );
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

function _getPublicImageRegistry(bag, next) {
  var who = bag.who + '|' + _getPublicImageRegistry.name;
  logger.verbose(who, 'Inside');

  envHandler.get('PUBLIC_IMAGE_REGISTRY',
    function (err, publicImageRegistry) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: PUBLIC_IMAGE_REGISTRY')
        );

      bag.publicImageRegistry = publicImageRegistry;
      logger.debug('Found public image registry');

      return next();
    }
  );
}

function _getPrivateImageRegistry(bag, next) {
  var who = bag.who + '|' + _getPrivateImageRegistry.name;
  logger.verbose(who, 'Inside');

  envHandler.get('PRIVATE_IMAGE_REGISTRY',
    function (err, privateImageRegistry) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: PRIVATE_IMAGE_REGISTRY')
        );

      bag.privateImageRegistry = privateImageRegistry;
      logger.debug('Found private image registry');

      return next();
    }
  );
}

function _generateEnvs(bag, next) {
  var who = bag.who + '|' + _generateEnvs.name;
  logger.verbose(who, 'Inside');

  bag.scriptEnvs = {
    'ADMIRAL_IP': global.config.admiralIP,
    'RUNTIME_DIR': global.config.runtimeDir,
    'CONFIG_DIR': global.config.configDir,
    'SSH_USER': global.config.sshUser,
    'SSH_PRIVATE_KEY': path.join(global.config.configDir, 'machinekey'),
    'SSH_PUBLIC_KEY': path.join(global.config.configDir, 'machinekey.pub'),
    'SCRIPTS_DIR': global.config.scriptsDir,
    'RELEASE': bag.releaseVersion,
    'PRIVATE_IMAGE_REGISTRY': bag.privateImageRegistry,
    'PUBLIC_IMAGE_REGISTRY': bag.publicImageRegistry,
    'WORKER_HOST': bag.config.address,
    'WORKER_PORT': bag.config.port
  };

  return next();
}

function _generateInitializeScript(bag, next) {
  var who = bag.who + '|' + _generateInitializeScript.name;
  logger.verbose(who, 'Inside');

  //attach header
  var filePath = path.join(global.config.scriptsDir, '/lib/_logger.sh');
  var headerScript = '';
  headerScript = headerScript.concat(__applyTemplate(filePath, bag.params));

  var helpers = headerScript;
  filePath = path.join(global.config.scriptsDir, '/lib/_helpers.sh');
  helpers = headerScript.concat(__applyTemplate(filePath, bag.params));

  var initializeScript = helpers;
  filePath = path.join(global.config.scriptsDir, 'cleanupWorker.sh');
  initializeScript =
    initializeScript.concat(__applyTemplate(filePath, bag.params));

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


function _cleanupWorker(bag, next) {
  var who = bag.who + '|' + _cleanupWorker.name;
  logger.verbose(who, 'Inside');

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
      bag.resBody = bag.config;
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
