'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var APIAdapter = require('../../common/APIAdapter.js');
var configHandler = require('../../common/configHandler.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: [],
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    params: {},
    skipStatusChange: false,
    component: 'msg',
    tmpScript: '/tmp/msg.sh'
  };

  bag.who = util.format('msg|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _generateInitializeEnvs.bind(null, bag),
      _generateInitializeScript.bind(null, bag),
      _writeScriptToFile.bind(null, bag),
      _initializeMsg.bind(null, bag),
      _postSystemIntegration.bind(null, bag),
      _post.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (!bag.skipStatusChange)
        _setCompleteStatus(bag, err);

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

  if (!_.has(bag.reqBody, 'password') || _.isEmpty(bag.reqBody.password)) {
    bag.skipStatusChange = true;
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :password')
    );
  }

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, msg) {
      if (err) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );
      }

      if (_.isEmpty(msg)) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );
      }

      bag.config = msg;
      return next();
    }
  );
}

function _setProcessingFlag(bag, next) {
  var who = bag.who + '|' + _setProcessingFlag.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: true,
    isFailed: false
  };

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

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
    'AMQP_PORT': bag.config.amqpPort,
    'ADMIN_PORT': bag.config.adminPort,
    'RABBITMQ_ADMIN':
      path.join(global.config.scriptsDir, '/docker/rabbitmqadmin')
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

  var initializeScript = headerScript;
  filePath = path.join(global.config.scriptsDir, 'docker/installMsg.sh');
  initializeScript = headerScript.concat(__applyTemplate(filePath, bag.params));

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

  var amqpAddress = (bag.config.isSecure ? 'amqps://' : 'amqp://') +
    bag.scriptEnvs.MSG_USER + ':' + bag.scriptEnvs.MSG_PASS +
    '@' + bag.scriptEnvs.MSG_HOST + ':' + bag.config.amqpPort;
  var httpAddress = (bag.config.isSecure ? 'https://' : 'http://') +
    bag.scriptEnvs.MSG_USER + ':' + bag.scriptEnvs.MSG_PASS +
    '@' + bag.scriptEnvs.MSG_HOST + ':' + bag.config.adminPort;

  var postObject = {
    name: 'msg',
    masterName: 'rabbitmqCreds',
    data: {
      amqpUrl: amqpAddress + '/shippable',
      amqpUrlRoot: amqpAddress + '/shippableRoot',
      amqpUrlAdmin: httpAddress,
      amqpDefaultExchange: 'shippableEx',
      rootQueueList: 'core.charon|versions.trigger|core.nf|nf.email|' +
        'nf.hipchat|nf.irc|nf.slack|nf.webhook|core.braintree|core.certgen|' +
        'core.hubspotSync|core.marshaller|marshaller.ec2|core.sync|' +
        'job.request|job.trigger|cluster.init|steps.deploy|steps.manifest|' +
        'steps.provision|steps.rSync|steps.release|core.logup|www.signals|' +
        'core.segment'
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

  var update = {
    isInstalled: true,
    isInitialized: true,
    uiUsername: bag.scriptEnvs.MSG_UI_USER,
    uiPassword: bag.scriptEnvs.MSG_UI_PASS,
    username: bag.scriptEnvs.MSG_USER,
    password: bag.scriptEnvs.MSG_PASS
  };

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      return next();
    }
  );
}

function _setCompleteStatus(bag, err) {
  var who = bag.who + '|' + _setCompleteStatus.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: false
  };
  if (err)
    update.isFailed = true;
  else
    update.isFailed = false;

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        logger.warn(err);
    }
  );
}

//local function to apply vars to template
function __applyTemplate(filePath, dataObj) {
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}
