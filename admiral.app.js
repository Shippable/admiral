'use strict';

process.title = 'shippable.admiral';
module.exports = init;
// To allow the Shippable adapter to make more than five calls at a time:
require('http').globalAgent.maxSockets = 10000;

require('./common/logger.js');
require('./common/ActErr.js');
require('./common/express/sendJSONResponse.js');
require('./common/respondWithError.js');
var favicon = require('serve-favicon');

var glob = require('glob');
var async = require('async');
var express = require('express');
var pg = require('pg');
var path = require('path');

global.util = require('util');
global.config = {};

process.on('uncaughtException',
  function (err) {
    _logErrorAndExit('uncaughtException thrown:', err);
  }
);

function init() {
  var bag = {
    app: global.app,
    env: process.env,
    config: {
      admiralPort: 50003
    }
  };

  bag.who = util.format('admiral.app|%s', init.name);

  async.series([
      _createExpressApp.bind(null, bag),
      _initializeConfig.bind(null, bag),
      _createClient.bind(null, bag),
      _initializeRoutes.bind(null, bag),
      _startListening.bind(null, bag),
      _setLogLevel.bind(null, bag)
    ],
    function (err) {
      if (err) {
        logger.error('Could not initialize api app: ' +
          util.inspect(err));
      } else {
        logger.info(bag.who, 'Completed');
        global.app = bag.app;
        module.exports = global.app;
      }
    }
  );
}

function _createExpressApp(bag, next) {
  try {
    var app = express();

    app.use(favicon('./common/favicon.ico'));
    app.use(require('body-parser').json({limit: '10mb'}));
    app.use(require('body-parser').urlencoded({limit: '10mb', extended: true}));
    app.use(require('compression')());
    app.use(require('cookie-parser')());
    app.use(require('method-override')());
    app.use(require('./common/express/errorHandler.js'));
    app.use(require('./common/express/setCORSHeaders.js'));

    // Views config
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    app.use(express.static(path.join(__dirname, './static')));

    bag.app = app;
    return next();
  } catch (err) {
    _logErrorAndExit('Uncaught Exception thrown from createExpressApp.', err);
  }
}

function _initializeConfig(bag, next) {
  var who = bag.who + '|' + _initializeConfig.name;

  var configErrors = [];

  if (bag.env.DBNAME)
    bag.config.dbName = bag.env.DBNAME;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'DBNAME is not defined'));

  if (bag.env.DBUSERNAME)
    bag.config.dbUsername = bag.env.DBUSERNAME;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'DBUSERNAME is not defined'));

  if (bag.env.DBPASSWORD)
    bag.config.dbPassword = bag.env.DBPASSWORD;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'DBPASSWORD is not defined'));

  if (bag.env.DBHOST)
    bag.config.dbHost = bag.env.DBHOST;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'DBHOST is not defined'));

  if (bag.env.DBPORT)
    bag.config.dbPort = bag.env.DBPORT;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'DBPORT is not defined'));

  if (bag.env.DBDIALECT)
    bag.config.dbDialect = bag.env.DBDIALECT;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'DBDIALECT is not defined'));

  if (bag.env.RUN_MODE)
    bag.config.runMode = bag.env.RUN_MODE;
  else
    bag.config.runMode = 'production';

  if (bag.env.LOGIN_TOKEN)
    bag.config.loginToken = bag.env.LOGIN_TOKEN;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'LOGIN_TOKEN is not defined'));

  if (bag.env.CONFIG_DIR)
    bag.config.configDir = bag.env.CONFIG_DIR;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'CONFIG_DIR is not defined'));

  if (bag.env.RUNTIME_DIR)
    bag.config.runtimeDir = bag.env.RUNTIME_DIR;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'RUNTIME_DIR is not defined'));

  if (bag.env.MIGRATIONS_DIR)
    bag.config.migrationsDir = bag.env.MIGRATIONS_DIR;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'MIGRATIONS_DIR is not defined'));

  if (bag.env.SERVICES_DIR)
    bag.config.servicesDir = bag.env.SERVICES_DIR;
  else
    configErrors.push(new ActErr(who, ActErr.ParamNotFound,
      'SERVICES_DIR is not defined'));

  bag.config.admiralEnv = util.format('%s/admiral.env', bag.config.configDir);
  if (configErrors.length)
    return next(configErrors);
  else
    global.config = bag.config;
  return next();
}

function _createClient(bag, next) {
  var who = bag.who + '|' + _createClient.name;
  logger.debug(who, 'Inside');

  var connectionString = util.format('%s://%s:%s@%s:%s/%s',
    bag.config.dbDialect, bag.config.dbUsername, bag.config.dbPassword,
    bag.config.dbHost, bag.config.dbPort, bag.config.dbName);

  global.config.client = new pg.Client(connectionString);
  global.config.client.connect(
    function (err) {
      return next(err);
    }
  );
}

function _initializeRoutes(bag, next) {
  var who = bag.who + '|' + _initializeRoutes.name;
  logger.debug(who, 'Inside');

  glob.sync('./api/**/*Routes.js').forEach(
    function (routeFile) {
      if (routeFile !== './api/Routes.js') {
        require(routeFile)(bag.app);
      }
    }
  );

  // Require www routes last, so the api routes aren't
  // overridden by the www redirect
  require('./api/Routes.js')(bag.app);

  return next();
}

function _startListening(bag, next) {
  var who = bag.who + '|' + _startListening.name;
  logger.debug(who, 'Inside');

  var listenAddr = '0.0.0.0';
  var admiralPort = bag.config.admiralPort;

  if (!admiralPort)
    return next(
      new ActErr(who, ActErr.InternalServer,
        'Failed to start server.', new Error('Invalid port.'))
    );

  bag.app.listen(admiralPort, listenAddr,
    function (err) {
      if (err)
        return next(err);
      logger.info('Admiral listening on %s.', admiralPort);
      return next();
    }
  );
}

function _setLogLevel(bag, next) {
  var who = bag.who + '|' + _setLogLevel.name;
  logger.debug(who, 'Inside');

  var loggerConfig = {};
  loggerConfig.runMode = bag.config.runMode;
  /* jshint ignore:start */
  logger.debug('------------------------------------------------------------');
  logger.debug('------------------------------------------------------------');
  logger.debug('------------- Admiral Successfully booted ------------------');
  logger.debug('------------------------------------------------------------');
  logger.debug('------------------------------------------------------------');
  /* jshint ignore:end*/
  logger.debug('Setting log level as ' + loggerConfig.runMode);
  logger.configLevel(loggerConfig);

  return next();
}

function _logErrorAndExit(message, err) {
  logger.error(message);

  if (err && err.message)
    logger.error(err.message);

  if (err && err.stack)
    logger.error(err.stack);

  setTimeout(
    function () {
      process.exit(1);
    },
    3000
  );
}

if (require.main === module)
  init();
