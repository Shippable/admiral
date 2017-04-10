'use strict';

var self = envHandler;
module.exports = self;

var _ = require('underscore');
var fs = require('fs');
var readline = require('readline');
var spawn = require('child_process').spawn;

function envHandler() {}

envHandler.get = function(envName, cb) {
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

envHandler.put = function(envName, envValue, cb) {
  var updateCmd = util.format('sudo sed -i \'s#.*%s=.*#%s="%s"#g\' %s',
    envName, envName, envValue, global.config.admiralEnv);

  logger.error('executing: ' + updateCmd)
  var exec = spawn('/bin/bash',
    ['-c', updateCmd]
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
      if (exitCode)
        return cb(exitCode, null);

      return cb(null);
    }
  );
};
