'use strict';

var self = postDefaultSystemCluster;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');
var ShippableAPIAdapter = require('../../common/ShippableAPIAdapter.js');

function postDefaultSystemCluster(req, res) {
  var bag = {
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('postDefaultSystemCluster|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getAPISystemIntegration.bind(null, bag),
      _getAdmiralEnv.bind(null, bag),
      _getSystemCodes.bind(null, bag),
      _getDefaultSystemCluster.bind(null, bag),
      _getSystemNodes.bind(null, bag),
      _getSystemMachineImages.bind(null, bag),
      _getRuntimeTemplates.bind(null, bag),
      _determineSystemCluster.bind(null, bag),
      _postDefaultSystemCluster.bind(null, bag),
      _linkSystemNodesToDefaultCluster.bind(null, bag),
      _getSubscriptions.bind(null, bag),
      _moveSubscriptionsToGrisham.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return respondWithError(res, err);

      sendJSONResponse(res, bag.resBody);
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _getAPISystemIntegration(bag, next) {
  var who = bag.who + '|' + _getAPISystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = 'name=api';
  bag.apiAdapter.getSystemIntegrations(query,
    function (err, systemIntegrations) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemIntegrations:' + util.inspect(err));

      bag.apiUrl = _.first(systemIntegrations).data.url;
      return next();
    }
  );
}

function _getAdmiralEnv(bag, next) {
  var who = bag.who + '|' + _getAdmiralEnv.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getAdmiralEnv(
    function (err, admiralEnv) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get admiralEnv : ' + util.inspect(err))
        );

      // Currently this is route is only for server customers
      if (!admiralEnv.IS_SERVER)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed because IS_SERVER : ' + admiralEnv.IS_SERVER)
        );

      bag.suToken = admiralEnv.SERVICE_USER_TOKEN;
      bag.shippableAPIAdapter =
        new ShippableAPIAdapter(bag.apiUrl, bag.suToken);
      return next();
    }
  );
}

function _getSystemCodes(bag, next) {
  var who = bag.who + '|' + _getSystemCodes.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemCodes(query,
    function (err, systemCodes) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemCodes:' + util.inspect(err));

      if (_.isEmpty(systemCodes))
        return next(who, ActErr.DBEntityNotFound, 'No system codes found.');

      bag.systemCodes = systemCodes;
      bag.archTypeCodesByCode = _.indexBy(
        _.where(bag.systemCodes, {group: 'archType'}),
        'code'
      );
      bag.clusterTypeCodesByName = _.indexBy(
        _.where(bag.systemCodes, {group: 'clusterType'}),
        'name'
      );
      return next();
    }
  );
}

function _getDefaultSystemCluster(bag, next) {
  var who = bag.who + '|' + _getDefaultSystemCluster.name;
  logger.verbose(who, 'Inside');

  var query = 'isDefault=true';
  bag.apiAdapter.getSystemClusters(query,
    function (err, systemClusters) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemClusters:' + util.inspect(err));

      if (systemClusters) {
        bag.defaultSystemCluster = _.first(systemClusters);
        bag.resBody = 'Default Shared Node Pool Exists';
      }

      return next();
    }
  );
}

function _getSystemNodes(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _getSystemNodes.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemNodes(query,
    function (err, systemNodes) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemNodes:' + util.inspect(err));

      bag.systemNodes = systemNodes;
      return next();
    }
  );
}

function _getSystemMachineImages(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _getSystemMachineImages.name;
  logger.verbose(who, 'Inside');

  var query = '';
  bag.apiAdapter.getSystemMachineImages(query,
    function (err, systemMachineImages) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get systemMachineImages:' + util.inspect(err));

      bag.defaultSystemMachineImage = _.findWhere(
        systemMachineImages, {isDefault: true}
      );
      return next();
    }
  );
}

function _getRuntimeTemplates(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _getRuntimeTemplates.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getRuntimeTemplates(
    function (err, runtimeTemplates) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get runtimeTemplates:' + util.inspect(err));

      if (!_.isEmpty(runtimeTemplates))
        bag.runtimeTemplates = runtimeTemplates;
      return next();
    }
  );
}

function _determineSystemCluster(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _determineSystemCluster.name;
  logger.verbose(who, 'Inside');

  var defaultSMI = bag.defaultSystemMachineImage;
  // Use default SMI to figure out the runtimeTemplate
  var runtimeTemplate;

  if (defaultSMI) {
    runtimeTemplate = _.findWhere(bag.runtimeTemplates,
      {
        id: defaultSMI.runtimeTemplateId
      }
    );
  }

  // If runtimeTemplate is not found, we default to default runtimeTemplate
  // for x86_64 architecture and Ubuntu_14.04 OS
  if (!runtimeTemplate) {
    logger.warn('%s: Failed to find runtimeTemplate. Setting default '+
      'runtimeTemplate.', who);

    runtimeTemplate = _.findWhere(bag.runtimeTemplates,
      {
        archTypeCode: _.findWhere(bag.systemCodes,
          {name: 'x86_64', group: 'archType'}).code,
        osTypeCode: _.findWhere(bag.systemCodes,
          {name: 'Ubuntu_14.04', group: 'osType'}).code,
        isDefault: true
      }
    );
  }

  // Next, we use the default SMI to figure out the clusterNodeArchitecture.
  // If this is not defined, we default to x86_64.
  var clusterNodeArchitecture;
  if (defaultSMI)
    clusterNodeArchitecture =
      bag.archTypeCodesByCode[defaultSMI.archTypeCode].name;
  else
    clusterNodeArchitecture = 'x86_64';

  // The OS is either Ubuntu_16.04 or Ubuntu_14.04. We first default to
  // Ubuntu_14.04. If the architecture is aarch64, we modify it to
  // Ubuntu 16.04 as that is the only OS we support for it.
  // Later we switch the OS to Ubuntu_16.04 if _any_ one of the nodes
  // is 16.04.

  var clusterNodeOS = 'Ubuntu_14.04';
  // for aarch64 architecture we default it to Ubuntu_16.04
  if (clusterNodeArchitecture === 'aarch64')
    clusterNodeOS = 'Ubuntu_16.04';
  else {
    var someNodeIsUbuntu16 = _.some(bag.systemNodes,
      function (systemNode) {
        try {
          var initScript = JSON.parse(systemNode.initScript);
          if (initScript && /16\.04/.test(initScript.name))
            return true;
        } catch (err) {
          // Nothing to do. Assume its Ubuntu 14.04.
        }
        return false;
      }
    );

    if (someNodeIsUbuntu16) {
      clusterNodeOS = 'Ubuntu_16.04';
      // Adjust the runtimeTemplate to 16.04.
      runtimeTemplate = _.findWhere(bag.runtimeTemplates,
        {
          archTypeCode: _.findWhere(bag.systemCodes,
            {name: 'x86_64', group: 'archType'}).code,
          osTypeCode: _.findWhere(bag.systemCodes,
            {name: 'Ubuntu_16.04', group: 'osType'}).code,
          version: runtimeTemplate.version
        }
      );
    }
  }

  // We can finally determine the clusterTypeName minus the size with the
  // above fields.
  var clusterTypeName =
    util.format('custom__%s__%s', clusterNodeArchitecture, clusterNodeOS);

  var clusterType = bag.clusterTypeCodesByName[clusterTypeName];
  var clusterTypeCode;
  if (clusterType) {
    clusterTypeCode = clusterType.code;
  } else {
    // This is a fail-safe. If for some reason we have bad data
    // warn and set sane defaults.
    logger.warn('%s: Failed to find clusterTypeCode for subscriptionId' +
      ' %s. Setting default clusterType.', who, bag.subscriptionId);

    var defaultCustomClusterTypeName = 'custom__x86_64__Ubuntu_14.04';
    clusterTypeCode =
      bag.clusterTypeCodesByName[defaultCustomClusterTypeName].code;
  }

  bag.newSystemCluster = {
    name: 'default_shared_node_pool',
    queueName: 'systemNodes.exec',
    clusterTypeCode: clusterTypeCode,
    runtimeTemplateId: runtimeTemplate.id,
    isDefault: true
  };

  return next();
}

function _postDefaultSystemCluster(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _postDefaultSystemCluster.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.postSystemCluster(bag.newSystemCluster,
    function (err, systemCluster) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to post systemCluster:' + util.inspect(err));

      bag.systemCluster = systemCluster;
      bag.resBody = systemCluster;
      return next();
    }
  );
}

function _linkSystemNodesToDefaultCluster(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _linkSystemNodesToDefaultCluster.name;
  logger.verbose(who, 'Inside');

  async.eachLimit(bag.systemNodes, 10,
    function (node, nextNode) {
      var update = {
        systemClusterId: bag.systemCluster.id
      };
      bag.apiAdapter.putSystemNodeById(node.id, update,
        function (err) {
          if (err)
            return nextNode(
              new ActErr(who, err.id, 'putSystemNodeById for id: ' +
                node.id + ' returned error')
            );

          return nextNode();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _getSubscriptions(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _getSubscriptions.name;
  logger.verbose(who, 'Inside');

  var query = 'subscriptionIds=***';
  bag.shippableAPIAdapter.getSubscriptions(query,
    function (err, subscriptions) {
      if (err)
        return next(who, ActErr.OperationFailed,
          'Failed to get subscriptions:' + util.inspect(err));

      bag.subscriptionIds = _.pluck(subscriptions, 'id');
      return next();
    }
  );
}

function _moveSubscriptionsToGrisham(bag, next) {
  if (!_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _moveSubscriptionsToGrisham.name;
  logger.verbose(who, 'Inside');

  async.eachLimit(bag.subscriptionIds, 10,
    function (subId, nextSubId) {
      var params = {
        subscriptionId: subId
      };
      bag.shippableAPIAdapter.moveToGrisham(params,
        function (err, subscription) {
          if (err)
            return nextSubId(
              new ActErr(who, err.id,
                'moveToGrisham for subscriptionId: ' +
                subId + ' returned error: ' + err.message)
            );

          return nextSubId();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}
