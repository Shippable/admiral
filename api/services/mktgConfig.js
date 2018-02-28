'use strict';

var self = mktgConfig;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var envHandler = require('../../common/envHandler.js');

function mktgConfig(params, callback) {
  var bag = {
    apiAdapter: params.apiAdapter,
    config: params.config,
    releaseVersion: params.releaseVersion,
    isSwarmClusterInitialized: params.isSwarmClusterInitialized,
    name: params.name,
    registry: params.registry,
    envs: '',
    mounts: '',
    runCommand: '',
    ignoreTLSEnv: 'IGNORE_TLS_ERRORS',
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: '',
    operatingSystem: params.operatingSystem
  };

  bag.who = util.format('mktgConfig|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series(
    [
      _checkInputParams.bind(null, bag),
      _getIgnoreTLSEnv.bind(null, bag),
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
      callback(null, bag.config, bag.runCommand);
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

  var query = 'masterName=url';
  bag.apiAdapter.getSystemIntegrations(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integrations: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations))
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No systemIntegration found for query: ' + query)
        );

      var defaultAPIIntegration = _.findWhere(
        systemIntegrations, {name: 'api'});
      var serviceAPIIntegration = _.findWhere(
        systemIntegrations, {name: bag.config.apiUrlIntegration});

      bag.apiSystemIntegration = serviceAPIIntegration || defaultAPIIntegration;

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
      new ActErr(who, ActErr.OperationFailed, 'No apiUrl found.')
    );

  var envs = '';
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_API_TOKEN', bag.serviceUserToken);
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_API_URL', apiUrl);

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

  var opts = ' --publish=50002:50002/tcp --restart=always --network=host' +
    ' --privileged=true';

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

  var opts;
  if (bag.operatingSystem === 'Ubuntu_14.04') {
    opts = ' --publish mode=host,target=50002,published=50002,protocol=tcp' +
      ' --network ingress' +
      ' --mode global' +
      ' --with-registry-auth' +
      ' --endpoint-mode vip';
  } else if (bag.operatingSystem === 'Ubuntu_16.04') {
    opts = ' --publish mode=host,target=50002,published=50002,protocol=tcp' +
      ' --mode global' +
      ' --with-registry-auth' +
      ' --endpoint-mode vip';
  } else if (bag.operatingSystem === 'CentOS_7') {
    opts = ' --publish mode=host,target=50002,published=50002,protocol=tcp' +
      ' --mode global' +
      ' --with-registry-auth' +
      ' --endpoint-mode vip';
  }

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
