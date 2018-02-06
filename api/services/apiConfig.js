'use strict';

var self = apiConfig;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var envHandler = require('../../common/envHandler.js');

function apiConfig(params, callback) {
  var bag = {
    config: params.config,
    name: params.name,
    registry: params.registry,
    releaseVersion: params.releaseVersion,
    isSwarmClusterInitialized: params.isSwarmClusterInitialized,
    envs: '',
    mounts: '',
    runCommand: '',
    vaultUrlEnv: 'VAULT_URL',
    vaultUrl: '',
    ignoreTLSEnv: 'IGNORE_TLS_ERRORS',
    vaultTokenEnv: 'VAULT_TOKEN',
    vaultToken: '',
    port: 50000
  };

  bag.who = util.format('apiConfig|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series(
    [
      _checkInputParams.bind(null, bag),
      _getIgnoreTLSEnv.bind(null, bag),
      _getVaultURL.bind(null, bag),
      _getVaultToken.bind(null, bag),
      _generateImage.bind(null, bag),
      _generateEnvs.bind(null, bag),
      _generateMounts.bind(null, bag),
      _generateRunCommandOnebox.bind(null, bag),
      _generateRunCommandCluster.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return callback(err);
      callback(null, bag.config, bag.runCommand);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  bag.config.replicas = bag.config.replicas;
  bag.config.serviceName = bag.name;

  if (bag.config.serviceName === 'internalAPI')
    bag.port = 50004;
  else if (bag.config.serviceName === 'consoleAPI')
    bag.port = 50005;

  return next();
}

function _getIgnoreTLSEnv(bag, next) {
  var who = bag.who + '|' + _getIgnoreTLSEnv.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.ignoreTLSEnv,
    function (err, shouldIgnoreTls) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.ignoreTLSEnv)
        );

      bag.shouldIgnoreTls = shouldIgnoreTls;
      logger.debug('Found ignoreTLS env: ', shouldIgnoreTls);

      return next();
    }
  );
}

function _getVaultURL(bag, next) {
  var who = bag.who + '|' + _getVaultURL.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.vaultUrlEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.vaultUrlEnv)
        );

      if (_.isEmpty(value))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No vault URL found')
        );

      logger.debug('Found vault URL');
      bag.vaultUrl = value;
      return next();
    }
  );
}

function _getVaultToken(bag, next) {
  var who = bag.who + '|' + _getVaultToken.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.vaultTokenEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.vaultTokenEnv)
        );

      if (_.isEmpty(value))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No vault token found')
        );

      logger.debug('Found vault token');
      bag.vaultToken = value;
      return next();
    }
  );
}

function _generateImage(bag, next) {
  var who = bag.who + '|' + _generateImage.name;
  logger.verbose(who, 'Inside');

  bag.config.image = util.format('%s/api:%s',
    bag.registry, bag.releaseVersion);

  return next();
}

function _generateEnvs(bag, next) {
  var who = bag.who + '|' + _generateEnvs.name;
  logger.verbose(who, 'Inside');

  var envs = '';
  envs = util.format('%s -e %s=%s',
    envs, 'DBNAME', global.config.dbName);
  envs = util.format('%s -e %s=%s',
    envs, 'DBUSERNAME', global.config.dbUsername);
  envs = util.format('%s -e %s=%s',
    envs, 'DBPASSWORD', global.config.dbPassword);
  envs = util.format('%s -e %s=%s',
    envs, 'DBHOST', global.config.dbHost);
  envs = util.format('%s -e %s=%s',
    envs, 'DBPORT', global.config.dbPort);
  envs = util.format('%s -e %s=%s',
    envs, 'DBDIALECT', global.config.dbDialect);
  envs = util.format('%s -e %s=%s',
    envs, 'VAULT_URL', bag.vaultUrl);
  envs = util.format('%s -e %s=%s',
    envs, 'VAULT_TOKEN', bag.vaultToken);
  envs = util.format('%s -e %s=%s',
    envs, 'API_PORT', bag.port);
  envs = util.format('%s -e %s=%s', envs,
    'API_URL_INTEGRATION', bag.config.apiUrlIntegration);

  if (bag.shouldIgnoreTls && bag.shouldIgnoreTls === 'true')
    envs = util.format('%s -e %s=%s', envs, 'NODE_TLS_REJECT_UNAUTHORIZED', 0);

  /* jshint camelcase:false */
  if (process.env.http_proxy)
    envs = util.format('%s -e http_proxy=%s', envs, process.env.http_proxy);

  if (process.env.https_proxy)
    envs = util.format('%s -e https_proxy=%s', envs, process.env.https_proxy);

  if (process.env.no_proxy)
    envs = util.format('%s -e no_proxy=%s', envs, process.env.no_proxy);
  /* jshint camelcase:true */

  bag.envs = envs;
  return next();
}

function _generateMounts(bag, next) {
  var who = bag.who + '|' + _generateMounts.name;
  logger.verbose(who, 'Inside');

  bag.mounts = '';
  return next();
}

function _generateRunCommandOnebox(bag, next) {
  if (bag.isSwarmClusterInitialized) return next();

  var who = bag.who + '|' + _generateRunCommandOnebox.name;
  logger.verbose(who, 'Inside');

  var opts = util.format(' --publish=%s:%s/tcp --network=host '+
    '--restart=always --privileged=true', bag.port, bag.port);

  var runCommand = util.format('docker run -d ' +
    ' %s %s %s --name %s %s',
    bag.envs,
    bag.mounts,
    opts,
    bag.config.serviceName,
    bag.config.image);

  bag.runCommand = runCommand;
  return next();
}

function _generateRunCommandCluster(bag, next) {
  if (!bag.isSwarmClusterInitialized) return next();

  var who = bag.who + '|' + _generateRunCommandCluster.name;
  logger.verbose(who, 'Inside');

  var opts = util.format(' --publish mode=host,target=%s,published=%s' +
    ',protocol=tcp' +
    ' --network ingress' +
    ' --mode global' +
    ' --with-registry-auth' +
    ' --endpoint-mode vip', bag.port, bag.port);

  var runCommand = util.format('docker service create ' +
    ' %s %s --name %s %s',
    bag.envs,
    opts,
    bag.config.serviceName,
    bag.config.image
  );

  bag.runCommand = runCommand;
  return next();
}
