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
    vaultUrlEnv: 'VAULT_URL',
    vaultUrl: '',
    vaultTokenEnv: 'VAULT_TOKEN',
    vaultToken: ''
  };

  bag.who = util.format('apiConfig|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getVaultURL.bind(null, bag),
      _getVaultToken.bind(null, bag),
      _generateImage.bind(null, bag),
      _generateEnvs.bind(null, bag),
      _generateMounts.bind(null, bag),
      _generateOpts.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return callback(err);
      callback(null, bag.config);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  bag.config.replicas = bag.config.replicas;
  bag.config.serviceName = bag.name;

  return next();
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

  bag.config.image = util.format('%s/%s:%s',
    bag.registry, bag.config.serviceName, global.config.release);

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

  bag.config.envs = envs;
  return next();
}

function _generateMounts(bag, next) {
  var who = bag.who + '|' + _generateMounts.name;
  logger.verbose(who, 'Inside');

  bag.config.mounts = '';
  return next();
}

function _generateOpts(bag, next) {
  var who = bag.who + '|' + _generateOpts.name;
  logger.verbose(who, 'Inside');

  var opts = ' --publish=50000:50000/tcp ' +
    ' --network=host'
    ' --privileged=true';

  bag.config.opts = opts;
  return next();
}
