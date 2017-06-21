'use strict';

var self = genexecConfig;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function genexecConfig(params, callback) {
  var bag = {
    apiAdapter: params.apiAdapter,
    config: params.config,
    name: params.name,
    envs: '',
    mounts: '',
    runCommand: '',
    serviceUserTokenEnv: 'SERVICE_USER_TOKEN',
    serviceUserToken: '',
    isDockerLegacy: false,
    dockerClientLatest: '/opt/docker/docker'
  };

  bag.who = util.format('genexecConfig|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getAPISystemIntegration.bind(null, bag),
      _getMsgSystemIntegration.bind(null, bag),
      _generateEnvs.bind(null, bag),
      _generateMounts.bind(null, bag),
      _generateRunCommandOnebox.bind(null, bag)
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

  bag.config.serviceName = 'shippable-exec-' + bag.config.nodeId;

  return next();
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

function _generateEnvs(bag, next) {
  var who = bag.who + '|' + _generateEnvs.name;
  logger.verbose(who, 'Inside');

  var apiUrl = bag.apiSystemIntegration.data &&
    bag.apiSystemIntegration.data.url;

  if (!apiUrl)
    return next(
      new ActErr(who, ActErr.OperationFailed, 'No apiUrl found.')
    );

  var amqpUrl = bag.msgSystemIntegration.data &&
    bag.msgSystemIntegration.data.amqpUrl;

  if (!amqpUrl)
    return next(
      new ActErr(who, ActErr.OperationFailed, 'No amqpUrl found.')
    );

  var amqpDefaultExchange = bag.msgSystemIntegration.data &&
    bag.msgSystemIntegration.data.amqpDefaultExchange;

  if (!amqpDefaultExchange)
    return next(
      new ActErr(who, ActErr.OperationFailed, 'No amqpDefaultExchange found.')
    );

  var envs = '';
  envs = util.format('%s -e %s=%s', envs, 'SHIPPABLE_API_URL', apiUrl);
  envs = util.format('%s -e %s=%s', envs, 'SHIPPABLE_AMQP_URL',
    amqpUrl);
  envs = util.format('%s -e %s=%s', envs, 'SHIPPABLE_AMQP_DEFAULT_EXCHANGE',
    amqpDefaultExchange);
  envs = util.format('%s -e %s=%s', envs, 'COMPONENT', bag.name);
  envs = util.format('%s -e %s=%s', envs, 'NODE_ID', bag.config.nodeId);
  envs = util.format('%s -e %s=%s', envs, 'NODE_TYPE_CODE',
    bag.config.nodeTypeCode);
  envs = util.format('%s -e %s=%s', envs, 'RUN_MODE', bag.config.runMode);
  envs = util.format('%s -e %s=%s', envs, 'LISTEN_QUEUE',
    bag.config.listenQueue);
  envs = util.format('%s -e %s=%s', envs, 'IS_DOCKER_LEGACY',
    bag.isDockerLegacy);
  envs = util.format('%s -e %s=%s', envs, 'DOCKER_CLIENT_LATEST',
    bag.dockerClientLatest);

  bag.envs = envs;
  return next();
}

function _generateMounts(bag, next) {
  var who = bag.who + '|' + _generateMounts.name;
  logger.verbose(who, 'Inside');

  bag.mounts = '-v /usr/lib/x86_64-linux-gnu/libapparmor.so.1.1.0:' +
    '/lib/x86_64-linux-gnu/libapparmor.so.1:rw' +
    ' -v /var/run:/var/run:rw' +
    ' -v /opt/docker/docker:/usr/bin/docker:rw '+
    ' -v /var/run/docker.sock:/var/run/docker.sock:rw '+
    ' -v /tmp/cexec:/tmp/cexec:rw ' +
    ' -v /build:/build:rw' +
    ' -v /tmp/ssh:/tmp/ssh:rw' +
    ' -v /home/shippable/cache:/home/shippable/cache:rw';

  return next();
}

function _generateRunCommandOnebox(bag, next) {
  var who = bag.who + '|' + _generateRunCommandOnebox.name;
  logger.verbose(who, 'Inside');

  var opts = ' --net=host --restart=always' +
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
