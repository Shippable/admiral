'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

 bag.who = util.format('systemClusters|%s', self.name);
 logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getDefaultSystemCluster.bind(null, bag),
      _updateDefaultSystemCluster.bind(null, bag),
      _post.bind(null, bag),
      _getSystemCluster.bind(null, bag)
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

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  if (!bag.reqBody.name)
    return next(
      new ActErr(who, ActErr.ShippableAdapter400, 'Missing body data :name')
    );

  var nameRegex = /^[a-zA-Z0-9\-\_]{3,255}$/;
  if (!nameRegex.test(bag.reqBody.name))
    return next(
      new ActErr(who, ActErr.ShippableAdapter400,
        'Invalid body data :name. Name should be 3-255 alphanumeric,' +
        ' underscore, or dash characters.')
    );

  if (!bag.reqBody.clusterTypeCode)
    return next(
      new ActErr(who, ActErr.ShippableAdapter400,
        'Missing body data :clusterTypeCode')
    );

  if (!bag.reqBody.runtimeTemplateId)
    return next(
      new ActErr(who, ActErr.ShippableAdapter400,
        'Missing body data :runtimeTemplateId'
      )
    );

  if (_.has(bag.reqBody, 'isDefault') && !_.isBoolean(bag.reqBody.isDefault))
    return next(
      new ActErr(who, ActErr.ShippableAdapter400,
        'Invalid body data :isDefault. isDefault should be boolean')
      );

  return next();
}



function _getDefaultSystemCluster(bag, next) {
  if (!bag.reqBody.isDefault) return next();

  var who = bag.who + '|' + _getDefaultSystemCluster.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "systemClusters" WHERE "isDefault"=true';

  global.config.client.query(query,
    function (err, systemCluster) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemCluster with error: ' + util.inspect(err))
        );

      bag.defaultSystemCluster = systemCluster.rows[0];
      return next();
    }
  );
}

function _updateDefaultSystemCluster(bag, next) {
  if (!bag.reqBody.isDefault) return next();
  if (_.isEmpty(bag.defaultSystemCluster)) return next();

  var who = bag.who + '|' + _updateDefaultSystemCluster.name;
  logger.verbose(who, 'Inside');

  var query = util.format('UPDATE "systemClusters" set "isDefault" = false ' +
    'where id =\'%s\'', bag.defaultSystemCluster.id);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update systemCluster with error: ' + util.inspect(err))
        );
      return next();
    }
  );
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  if (_.has(bag.reqBody, 'queueName'))
    bag.queueName = bag.reqBody.queueName;
  else
    bag.queueName = null;

  if (_.has(bag.reqBody, 'isDefault'))
    bag.isDefault = bag.reqBody.isDefault;
  else
    bag.isDefault = false;

  var insertStatement = util.format('INSERT INTO "systemClusters" ' +
    '("name", "queueName", "clusterTypeCode", "runtimeTemplateId", ' +
    '"isDefault", "createdAt", "updatedAt") ' +
    'values (\'%s\', \'%s\', \'%s\', \'%s\', \'%s\', CURRENT_TIMESTAMP, ' +
    'CURRENT_TIMESTAMP)', bag.reqBody.name, bag.queueName,
    bag.reqBody.clusterTypeCode, bag.reqBody.runtimeTemplateId, bag.isDefault);

  global.config.client.query(insertStatement,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to create systemCluster with error: ' +
            util.inspect(err))
        );

      return next();
    }
  );
}

function _getSystemCluster(bag, next) {
  var who = bag.who + '|' + _getSystemCluster.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemClusters" WHERE name=\'%s\'',
    bag.reqBody.name);

  global.config.client.query(query,
    function (err, systemClusters) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemCluster with error: ' + util.inspect(err))
        );

      if (_.isEmpty(systemClusters.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemCluster not found for name: ' + bag.reqBody.name)
        );

      logger.debug('Found systemCluster ' + bag.reqBody.name);

      bag.resBody = systemClusters.rows[0];
      return next();
    }
  );
}
