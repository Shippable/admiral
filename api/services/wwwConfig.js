'use strict';

var self = wwwConfig;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var envHandler = require('../../common/envHandler.js');

function wwwConfig(params, callback) {
  var bag = {
    apiAdapter: params.apiAdapter,
    config: params.config,
    releaseVersion: params.releaseVersion,
    isSwarmClusterInitialized: params.isSwarmClusterInitialized,
    name: params.name,
    registry: params.registry,
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: ''
  };

  bag.who = util.format('wwwConfig|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getServiceUserToken.bind(null, bag),
      _getAPISystemIntegration.bind(null, bag),
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

function _getServiceUserToken(bag, next) {
  var who = bag.who + '|' + _getServiceUserToken.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.serviceUserTokenEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.serviceUserTokenEnv)
        );

      if (_.isEmpty(value))
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No serviceUserToken found.')
        );

      bag.serviceUserToken = value;

      return next();
    }
  );
}

function _getAPISystemIntegration(bag, next) {
  var who = bag.who + '|' + _getAPISystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = 'name=api&masterName=url';
  bag.apiAdapter.getSystemIntegrations(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integrations: ' + util.inspect(err))
        );

      if (!systemIntegrations.length)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No api systemIntegration found.')
        );

      bag.apiSystemIntegration = _.first(systemIntegrations);

      return next();
    }
  );
}

function _generateImage(bag, next) {
  var who = bag.who + '|' + _generateImage.name;
  logger.verbose(who, 'Inside');

  bag.config.image = util.format('%s/%s:%s',
    bag.registry, bag.config.serviceName, bag.releaseVersion);

  return next();
}

function _generateEnvs(bag, next) {
  var who = bag.who + '|' + _generateEnvs.name;
  logger.verbose(who, 'Inside');

  var apiUrl = bag.apiSystemIntegration.data &&
    bag.apiSystemIntegration.data.url;

  if (!apiUrl)
    return next(
      new ActErr(who, ActErr.OperationFailed,
        'No apiUrl found.')
    );

  var envs = '';
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_API_TOKEN', bag.serviceUserToken);
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_API_URL', apiUrl);

  bag.config.envs = envs;
  return next();
}

function _generateMounts(bag, next) {
  var who = bag.who + '|' + _generateMounts.name;
  logger.verbose(who, 'Inside');

  bag.config.mounts = '';
  return next();
}

function _generateRunCommandOnebox(bag, next) {
  if (bag.isSwarmClusterInitialized) return next();

  var who = bag.who + '|' + _generateRunCommandOnebox.name;
  logger.verbose(who, 'Inside');

  var opts = ' --publish=50001:50001/tcp ' +
    ' --network=host' +
    ' --privileged=true';

  var runCommand = util.format('docker run -d ' +
    ' %s %s %s --name %s %s',
    bag.config.envs,
    bag.config.mounts,
    opts,
    bag.config.serviceName,
    bag.config.image);

  bag.config.runCommand = runCommand;
  return next();
}

function _generateRunCommandCluster(bag, next) {
  if (!bag.isSwarmClusterInitialized) return next();

  var who = bag.who + '|' + _generateRunCommandCluster.name;
  logger.verbose(who, 'Inside');

  var opts = ' --publish mode=host,target=50001,published=50001,protocol=tcp' +
    ' --network ingress' +
    ' --mode global' +
    ' --with-registry-auth' +
    ' --endpoint-mode vip';

  var runCommand = util.format('docker service create ' +
    ' %s %s --name %s %s',
    bag.config.envs,
    opts,
    bag.config.serviceName,
    bag.config.image
  );

  bag.config.runCommand = runCommand;
  return next();
}
