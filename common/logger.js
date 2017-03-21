'use strict';
var winston = require('winston');
var WinstonFileTransport = winston.transports.File;
var WinstonConsoleTransport = winston.transports.Console;

configLevel();

exports = winston;
module.exports = winston;
global.logger = winston;

exports.configLevel = configLevel;

function configLevel(config) {
  winston.clear();

  config = config || {};

  var logLevel = 'debug';
  if (config.runMode === 'beta') {
    logLevel = 'verbose';
  } else if (config.runMode === 'production') {
    logLevel = 'warn';
  }

  winston.add(WinstonConsoleTransport, {
    timestamp: true,
    colorize: true,
    level: logLevel
  });

  winston.add(WinstonFileTransport, {
    name: 'file#out',
    timestamp: true,
    colorize: true,
    filename: '/var/run/shippable/logs/api_' + config.runMode + '_out.log',
    maxsize: 10485760,// maxsize: 10mb
    maxFiles: 20,
    level: logLevel,
    json: false
  });

  winston.add(WinstonFileTransport, {
    name: 'file#err',
    timestamp: true,
    colorize: true,
    filename: '/var/run/shippable/logs/api_' + config.runMode + '_err.log',
    maxsize: 10485760,// maxsize: 10mb
    maxFiles: 20,
    level: 'error',
    json: false
  });

  winston.add(WinstonFileTransport, {
    name: 'file#warn',
    timestamp: true,
    colorize: true,
    filename: '/var/run/shippable/logs/api_' + config.runMode + '_warn.log',
    maxsize: 5242880,// maxsize: 5mb
    maxFiles: 20,
    level: 'warn',
    json: false
  });
}
