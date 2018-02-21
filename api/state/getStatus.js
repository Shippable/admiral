'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var fs = require('fs-extra');
var path = require('path');
var spawn = require('child_process').spawn;
var url = require('url');

var GitLabAdapter = require('../../common/GitLabAdapter.js');
var APIAdapter = require('../../common/APIAdapter.js');
var envHandler = require('../../common/envHandler.js');

function getStatus(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {
      isReachable: false,
      error: null
    },
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    tmpScriptFilename: '/tmp/checkGitLabSSHPort.sh',
    tmpScriptWritten: false,
    component: 'state',
    gitlabUrl: null,
    gitlabSSHPort: null,
    gitlabUsername: null,
    gitlabPassword: null,
    gitlabAdapter: null
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _initializeGitLabAdapter.bind(null, bag),
      _getGitLabUser.bind(null, bag),
      _getOperatingSystem.bind(null, bag),
      _getArchitecture.bind(null, bag),
      _generatePortCheckScript.bind(null, bag),
      _writePortCheckScriptToFile.bind(null, bag),
      _checkSSHPort.bind(null, bag),
      _getStatus.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      _removePortCheckScript(bag);

      if (err)
        return respondWithError(res, err);

      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _getSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('name=state&masterName=gitlabCreds',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No state system integration found')
        );

      var systemIntegration = systemIntegrations[0];

      bag.gitlabUrl = systemIntegration.data.url;
      bag.gitlabSSHPort = systemIntegration.data.sshPort;
      bag.gitlabUsername = systemIntegration.data.username;
      bag.gitlabPassword = systemIntegration.data.password;

      return next();
    }
  );
}

function _initializeGitLabAdapter(bag, next) {
  var who = bag.who + '|' + _initializeGitLabAdapter.name;
  logger.verbose(who, 'Inside');

  bag.gitlabAdapter = new GitLabAdapter(null, bag.gitlabUrl,
    bag.gitlabUsername, bag.gitlabPassword);

  bag.gitlabAdapter.initialize(
    function (err) {
      if (err)
        bag.resBody.error = 'Failed to intialize GitLab adapter with error ' +
          util.inspect(err);

      return next();
    }
  );
}

function _getGitLabUser(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _getGitLabUser.name;
  logger.verbose(who, 'Inside');


  bag.gitlabAdapter.getCurrentUser(
    function (err, user) {
      if (err) {
        bag.resBody.error = util.format(
          'Failed to get GitLab user %s', bag.gitlabUsername);
        return next();
      }

      /* jshint camelcase:false */
      if (!user.is_admin) {
      /* jshint camelcase:true */
        bag.resBody.error = util.format(
          'GitLab user %s is not an admin', bag.gitlabUsername);
        return next();
      }

      return next();
    }
  );
}

function _getOperatingSystem(bag, next) {
  var who = bag.who + '|' + _getOperatingSystem.name;
  logger.verbose(who, 'Inside');

  envHandler.get('OPERATING_SYSTEM',
    function (err, operatingSystem) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: OPERATING_SYSTEM')
        );

      bag.operatingSystem = operatingSystem;
      logger.debug('Found Operating System');

      return next();
    }
  );
}

function _getArchitecture(bag, next) {
  var who = bag.who + '|' + _getArchitecture.name;
  logger.verbose(who, 'Inside');

  envHandler.get('ARCHITECTURE',
    function (err, architecture) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ARCHITECTURE')
        );

      bag.architecture = architecture;
      logger.debug('Found Architecture');

      return next();
    }
  );
}

function _generatePortCheckScript(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _generatePortCheckScript.name;
  logger.verbose(who, 'Inside');

  //attach header
  var headerScript = '';
  var filePath = path.join(global.config.scriptsDir, '/lib/_logger.sh');
  headerScript = headerScript.concat(__applyTemplate(filePath, {}));

  filePath = path.join(global.config.scriptsDir, bag.architecture,
    bag.operatingSystem, 'check_port.sh');
  bag.script = headerScript.concat(__applyTemplate(filePath, {}));

  return next();
}

function _writePortCheckScriptToFile(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _writePortCheckScriptToFile.name;
  logger.debug(who, 'Inside');

  fs.writeFile(bag.tmpScriptFilename, bag.script,
    function (err) {
      if (err) {
        var msg = util.format('%s, Failed with err:%s', who, err);
        return next(
          new ActErr(who, ActErr.OperationFailed, msg)
        );
      }
      bag.tmpScriptWritten = true;
      fs.chmodSync(bag.tmpScriptFilename, '755');
      return next();
    }
  );
}

function _checkSSHPort(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _checkSSHPort.name;
  logger.verbose(who, 'Inside');

  var address = url.parse(bag.gitlabUrl).hostname;
  var env = {
    'IP': address,
    'PORT': bag.gitlabSSHPort,
  };

  /* jshint camelcase:false */
  if (process.env.http_proxy)
    env.http_proxy = process.env.http_proxy;

  if (process.env.https_proxy)
    env.https_proxy = process.env.https_proxy;

  if (process.env.no_proxy)
    env.no_proxy = process.env.no_proxy;
  /* jshint camelcase:true */

  var exec = spawn('/bin/bash',
    ['-c', bag.tmpScriptFilename],
    {
      env: env
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
        bag.resBody.error = 'Unable to access SSH port ' + bag.gitlabSSHPort;

      return next();
    }
  );
}

function _getStatus(bag, next) {
  if (bag.resBody.error) return next();

  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  bag.resBody.isReachable = true;

  return next();
}

function _removePortCheckScript(bag) {
  if (!bag.tmpScriptWritten) return;

  var who = bag.who + '|' + _getStatus.name;
  logger.verbose(who, 'Inside');

  fs.remove(bag.tmpScriptFilename,
    function (error) {
      if (error)
        logger.warn(
          util.format(
            '%s, Failed to remove %s %s', who, bag.tmpScriptFilename, error)
        );
    }
  );
}

//local function to apply vars to template
function __applyTemplate(filePath, dataObj) {
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}
