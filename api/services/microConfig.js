'use strict';

var self = microConfig;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var envHandler = require('../../common/envHandler.js');

function microConfig(params, callback) {
  var bag = {
    apiAdapter: params.apiAdapter,
    releaseVersion: params.releaseVersion,
    isSwarmClusterInitialized: params.isSwarmClusterInitialized,
    config: params.config,
    name: params.name,
    registry: params.registry,
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: ''
  };

  bag.who = util.format('microConfig|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getServiceUserToken.bind(null, bag),
      _getAPISystemIntegration.bind(null, bag),
      _getMsgSystemIntegration.bind(null, bag),
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

function _getMsgSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getMsgSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = 'name=msg&masterName=rabbitmqCreds';
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
            'No msg systemIntegration found.')
        );

      bag.msgSystemIntegration = _.first(systemIntegrations);

      return next();
    }
  );
}

function _generateImage(bag, next) {
  var who = bag.who + '|' + _generateImage.name;
  logger.verbose(who, 'Inside');

  bag.config.image = util.format('%s/micro:%s',
    bag.registry, bag.releaseVersion);

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

  var amqpUrlRoot = bag.msgSystemIntegration.data &&
    bag.msgSystemIntegration.data.amqpUrlRoot;

  if (!amqpUrlRoot)
    return next(
      new ActErr(who, ActErr.OperationFailed, 'No amqpUrlRoot found.')
    );

  var amqpDefaultExchange = bag.msgSystemIntegration.data &&
    bag.msgSystemIntegration.data.amqpDefaultExchange;

  if (!amqpDefaultExchange)
    return next(
      new ActErr(who, ActErr.OperationFailed, 'No amqpDefaultExchange found.')
    );

  var component;

  if (_.contains(['deploy', 'manifest', 'provision', 'release', 'rSync'],
    bag.name))
    component = 'stepExec';
  else
    component = bag.name;


  var envs = '';
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_API_TOKEN', bag.serviceUserToken);
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_API_URL', apiUrl);
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_ROOT_AMQP_URL', amqpUrlRoot);
  envs = util.format('%s -e %s=%s',
    envs, 'SHIPPABLE_AMQP_DEFAULT_EXCHANGE', amqpDefaultExchange);
  envs = util.format('%s -e %s=%s',
    envs, 'COMPONENT', component);

  if (component === 'stepExec')
    envs = util.format('%s -e %s=%s',
      envs, 'JOB_TYPE', bag.name);
  else if (component === 'irc')
    envs = util.format('%s -e %s=%s',
      envs, 'IRC_BOT_NICK', 'shippable');

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

  var opts = ' --network=host' +
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

  var replicas = util.format(' --replicas %s', bag.config.replicas);
  if (bag.replicas === 'global')
    replicas = ' --mode global';

  var opts = ' --network ingress' +
    ' --with-registry-auth' +
    ' --endpoint-mode vip';

  var runCommand = util.format('docker service create ' +
    ' %s %s %s --name %s %s',
    bag.config.envs,
    opts,
    replicas,
    bag.config.serviceName,
    bag.config.image
  );

  bag.config.runCommand = runCommand;
  return next();
}
