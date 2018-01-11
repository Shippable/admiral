'use strict';

var self = envHandler;
module.exports = self;

var _ = require('underscore');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;

function envHandler() {}

envHandler.get = function (envName, cb) {
  var envValue = '';
  var filereader = readline.createInterface({
    input: fs.createReadStream(global.config.admiralEnv),
    console: false
  });

  filereader.on('line',
    function (envLine) {
      if (!_.isEmpty(envLine) && envLine.indexOf(envName) >= 0) {
        envValue = envLine.split('=')[1];
        envValue = JSON.parse(envValue);
      }
    }
  );

  filereader.on('close',
    function () {
      return cb(null, envValue);
    }
  );
};

envHandler.post = function (envName, envValue, cb) {
  if (_.isUndefined(envName) || _.isNull(envName) ||
    _.isUndefined(envValue) || _.isNull(envValue))
    return cb('envName or envValue cannot be null');

  var createCmd = util.format('sudo echo \'%s="%s"\' >> %s',
    envName, envValue, global.config.admiralEnv);

  var exec = spawn('/bin/bash',
    ['-c', createCmd]
  );

  exec.stdout.on('data',
    function (data)  {
      logger.debug(self.name, data.toString());
    }
  );

  exec.stderr.on('data',
    function (data)  {
      logger.error(self.name, data.toString());
    }
  );

  exec.on('close',
    function (exitCode)  {
      if (exitCode)
        return cb(exitCode, null);

      return cb(null);
    }
  );
};

envHandler.put = function (envName, envValue, cb) {
  var updateCmd = util.format('sudo sed -i \'s#.*%s=.*#%s="%s"#g\' %s',
    envName, envName, envValue, global.config.admiralEnv);

  var exec = spawn('/bin/bash',
    ['-c', updateCmd]
  );

  exec.stdout.on('data',
    function (data)  {
      logger.debug(self.name, data.toString());
    }
  );

  exec.stderr.on('data',
    function (data)  {
      logger.error(self.name, data.toString());
    }
  );

  exec.on('close',
    function (exitCode)  {
      if (exitCode)
        return cb(exitCode, null);

      return cb(null);
    }
  );
};
