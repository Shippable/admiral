'use strict';

var self = deleteById;
module.exports = self;

var async = require('async');
var RabbitAdapter = require('../../common/RabbitMQAdapter.js');
var APIAdapter = require('../../common/APIAdapter.js');
var _ = require('underscore');

function deleteById(req, res) {
  var bag = {
    systemCluster: {},
    inputParams: req.params,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    resBody: {}
  };

  bag.who = util.format('systemClusters|%s|callerId:%s|id:', self.name,
    bag.callerId, bag.inputParams.systemClusterId);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemCluster.bind(null, bag),
      _getProcessingSystemCode.bind(null, bag),
      _getSystemNodes.bind(null, bag),
      _deleteSystemNodes.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _getQueue.bind(null, bag),
      _deleteQueue.bind(null, bag),
      _deleteById.bind(null, bag)
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

  if (!bag.inputParams.systemClusterId)
    return next(
      new ActErr(who, ActErr.ParamNotFound, 'Route parameter not found :id')
    );

  return next();
}

function _getSystemCluster(bag, next) {
  var who = bag.who + '|' + _getSystemCluster.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "systemClusters" WHERE "id" = ' +
    bag.inputParams.systemClusterId;

  global.config.client.query(query,
    function (err, systemClusters) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemClusters with error: ' + util.inspect(err))
        );

      if (systemClusters.rows)
        bag.systemCluster = _.first(systemClusters.rows);

      return next();
    }
  );
}

function _getProcessingSystemCode(bag, next) {
  var who = bag.who + '|' + _getProcessingSystemCode.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "code" FROM "systemCodes" WHERE '+
    '"group"=\'statusCodes\' AND "name"=\'PROCESSING\'';

  global.config.client.query(query,
    function (err, result) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to fetch STOPPED roleCode', err)
        );

      if (_.isEmpty(result.rows) || !result.rows[0].code)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No code found for group: statusCodes and name: PROCESSING')
        );
      bag.processingStatusCode = _.first(result.rows).code;
      logger.debug('PROCESSING status code is: ' + bag.processingStatusCode);
      return next();
    }
  );
}

function _getSystemNodes(bag, next) {
  var who = bag.who + '|' + _getSystemNodes.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "systemNodes" WHERE "systemClusterId"=' +
    bag.inputParams.systemClusterId;
  global.config.client.query(query,
    function (err, systemNodes) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemNodes with error: ' + util.inspect(err))
        );

      if (systemNodes.rows)
        bag.systemNodes = systemNodes.rows;

      var processingSystemNode =
        _.findWhere(bag.systemNodes, { statusCode: bag.processingStatusCode });

      if (processingSystemNode)
        return next(
          new ActErr(who, ActErr.ShippableAdapter400,
            'System Cluster cannot be deleted as one or more nodes are processing.')
        );

      return next();
    }
  );
}

function _deleteSystemNodes(bag, next) {
  if (_.isEmpty(bag.systemNodes)) return next();

  var who = bag.who + '|' + _deleteSystemNodes.name;
  logger.verbose(who, 'Inside');

  async.eachLimit(bag.systemNodes, 10,
    function (node, nextNode) {
      bag.apiAdapter.deleteSystemNodeById(node.id,
        function (err) {
          if (err)
            return nextNode(
              new ActErr(who, err.id, 'deleteSystemNodeById for id: ' +
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

function _getSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('name=msg&masterName=rabbitmqCreds',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integration: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No msg system integration found')
        );

      bag.systemIntegration = systemIntegrations[0];
      bag.amqpUrlAdmin = bag.systemIntegration.data.amqpUrlAdmin;
      bag.rabbitAdapter = new RabbitAdapter(bag.amqpUrlAdmin);
      return next();
    }
  );
}

function _getQueue(bag, next) {
  if (!bag.systemCluster.queueName) return next();

  var who = bag.who + '|' + _getQueue.name;
  logger.verbose(who, 'Inside');

  bag.rabbitAdapter.getVhostQueue('shippable', bag.systemCluster.queueName,
    function (err, res) {
      if (err) {
        if (err === 404)
          return next();

        err = err || res;
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'failed to getVhostQueue for systemCluster: ' +
            bag.systemCluster.name + ' with error: ' + err)
          );
      }

      bag.rabbitMQQueue = res.name;
      return next();
    }
  );
}

function _deleteQueue(bag, next) {
  if (!bag.rabbitMQQueue) return next();

  var who = bag.who + '|' + _deleteQueue.name;
  logger.verbose(who, 'Inside');

  bag.rabbitAdapter.deleteQueue('shippable', bag.rabbitMQQueue,
    function (err, res) {
      if (err) {
        err = err || res;
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'failed to deleteQueue for systemCluster: ' +
            bag.systemCluster.name + ' with error: ' + err)
          );
      }

      return next();
    }
  );
}

function _deleteById(bag, next) {
  var who = bag.who + '|' + _deleteById.name;
  logger.verbose(who, 'Inside');

  var query = util.format('DELETE FROM "systemClusters" WHERE id=\'%s\'',
    bag.systemCluster.id);

  global.config.client.query(query,
    function (err, systemCluster) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            util.format('Failed to delete systemCluster with id: %s with error:' +
            ' %s', bag.systemCluster.id, util.inspect(err)))
        );

      if (systemCluster.rowCount === 1)
        bag.resBody.id = bag.systemCluster.id;

      return next();
    }
  );
}
