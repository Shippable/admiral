'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var uuid = require('node-uuid');
var path = require('path');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;

var envHandler = require('../../common/envHandler.js');

function post(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: {},
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: '',
    setServiceUserToken: false
  };

  bag.who = util.format('db|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _upsertSystemConfigs.bind(null, bag),
      _generateServiceUserToken.bind(null, bag),
      _setServiceUserToken.bind(null, bag),
      _post.bind(null, bag)
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

  return next();
}

function _upsertSystemConfigs(bag, next) {
  var who = bag.who + '|' + _upsertSystemConfigs.name;
  logger.verbose(who, 'Inside');

  var seriesBag = {
    who: who,
    params: {},
    script: '',
    tmpScriptFilename: '/tmp/systemConfigs.sh'
  };

  async.series([
      _generateSystemConfigsScript.bind(null, seriesBag),
      _writeSystemConfigsScriptToFile.bind(null, seriesBag),
      _runSystemConfigsScript.bind(null, seriesBag)
    ],
    function (err) {
      fs.remove(seriesBag.tmpScriptFilename,
        function (error) {
          if (error)
            logger.warn(
              util.format('%s, Failed to remove %s %s', who, path, error)
            );
        }
      );
      return next(err);
    }
  );
}


function _generateSystemConfigsScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _generateSystemConfigsScript.name;
  logger.verbose(who, 'Inside');

  //attach header
  var fileName = '../../lib/_logger.sh';

  var script = '';
  script = script.concat(__applyTemplate(fileName, seriesBag.params));

  fileName = '../../common/scripts/create_sys_configs.sh';
  script = script.concat(__applyTemplate(fileName, seriesBag.params));

  seriesBag.script = script;
  return next();
}

function _writeSystemConfigsScriptToFile(seriesBag, next) {
  var who = seriesBag.who + '|' + _writeSystemConfigsScriptToFile.name;
  logger.debug(who, 'Inside');

  fs.writeFile(seriesBag.tmpScriptFilename, seriesBag.script,
    function (err) {
      if (err) {
        var msg = util.format('%s, Failed with err:%s', who, err);
        return next(
          new ActErr(who, ActErr.OperationFailed, msg)
        );
      }
      fs.chmodSync(seriesBag.tmpScriptFilename, '755');
      return next();
    }
  );
}

function _runSystemConfigsScript(seriesBag, next) {
  var who = seriesBag.who + '|' + _runSystemConfigsScript.name;
  logger.verbose(who, 'Inside');

  var scriptEnvs = {
    'CONFIG_DIR': global.config.configDir,
    'SCRIPTS_DIR': global.config.scriptsDir,
    'DBUSERNAME': global.config.dbUsername,
    'DBNAME': global.config.dbName,
    'RELEASE': global.config.release
  };

  var exec = spawn('/bin/bash',
    ['-c', seriesBag.tmpScriptFilename],
    {
      cwd: '/',
      env: scriptEnvs
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

function _generateServiceUserToken(bag, next) {
  var who = bag.who + '|' + _generateServiceUserToken.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.serviceUserTokenEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.serviceUserTokenEnv)
        );

      if (_.isEmpty(value)) {
        logger.debug('Empty service user token, generating a new token');
        bag.serviceUserToken = uuid.v4();
        bag.setServiceUserToken = true;
      } else {
        logger.debug('Found existing service user token');
        bag.serviceUserToken = value;
      }

      return next();
    }
  );
}

function _setServiceUserToken(bag, next) {
  if (!bag.setServiceUserToken) return next();

  var who = bag.who + '|' + _setServiceUserToken.name;
  logger.verbose(who, 'Inside');

  envHandler.put(bag.serviceUserTokenEnv, bag.serviceUserToken,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot set env: ' + bag.serviceUserTokenEnv + ' err: ' + err)
        );

      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  return next();
}

//local function to apply vars to template
function __applyTemplate(fileName, dataObj) {
  var filePath = path.join(__dirname, fileName);
  var fileContent = fs.readFileSync(filePath).toString();
  var template = _.template(fileContent);

  return template({obj: dataObj});
}
