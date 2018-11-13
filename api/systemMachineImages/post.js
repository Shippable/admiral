'use strict';

var self = post;
module.exports = self;

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    systemMachineImageId: null
  };

  bag.who = util.format('systemMachineImages|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series(
    [
      _checkInputParams.bind(null, bag),
      _post.bind(null, bag),
      _getSystemMachineImage.bind(null, bag)
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
  /* jshint maxcomplexity:15 */
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  if (!bag.reqBody.externalId)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :externalId')
    );

  if (!bag.reqBody.provider)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :provider')
    );

  if (!bag.reqBody.name)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :name')
    );

  if (!bag.reqBody.description)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :description')
    );

  if (!bag.reqBody.archTypeCode)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :archTypeCode')
    );

  if (!_.isBoolean(bag.reqBody.isAvailable))
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :isAvailable')
    );

  if (!_.isBoolean(bag.reqBody.isDefault))
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :isDefault')
    );

  if (!bag.reqBody.region)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :region')
    );

  if (!bag.reqBody.keyName)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :keyName')
    );

  if (!bag.reqBody.runShImage)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :runShImage')
    );

  if (!bag.reqBody.securityGroup)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :securityGroup')
    );

  if (!bag.reqBody.drydockTag)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :drydockTag')
    );

  if (!bag.reqBody.drydockFamily)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :drydockFamily')
    );

  return next();
}


function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  bag.systemMachineImageId = mongoose.Types.ObjectId().toString();
  var insertStatement = util.format('INSERT INTO "systemMachineImages" ' +
    '("id", "name", "description", "externalId", "provider", "isAvailable", ' +
    '"isDefault", "region", "keyName", "runShImage", "securityGroup", ' +
    '"subnetId", "drydockTag", "drydockFamily", "sshUser", "sshPort", '+
    '"archTypeCode", "runtimeTemplateId", "privateSubnetId", "publicNatIp", ' +
    '"createdBy", "updatedBy", "createdAt", "updatedAt") values (\'%s\', ' +
    '\'%s\', \'%s\', \'%s\', \'%s\', %s, %s, \'%s\', \'%s\', \'%s\', ' +
    '\'%s\', %s, \'%s\', \'%s\', \'%s\', %s, %s, %s, %s, %s, ' +
    '\'54188262bc4d591ba438d62a\', \'54188262bc4d591ba438d62a\', ' +
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    bag.systemMachineImageId, bag.reqBody.name, bag.reqBody.description,
    bag.reqBody.externalId, bag.reqBody.provider, bag.reqBody.isAvailable,
    bag.reqBody.isDefault, bag.reqBody.region, bag.reqBody.keyName,
    bag.reqBody.runShImage, bag.reqBody.securityGroup,
    (!_.has(bag.reqBody, 'subnetId') || bag.reqBody.subnetId === null) ?
      'NULL' : util.format('\'%s\'', bag.reqBody.subnetId),
    bag.reqBody.drydockTag, bag.reqBody.drydockFamily, bag.reqBody.sshUser,
    bag.reqBody.sshPort, bag.reqBody.archTypeCode,
    _.has(bag.reqBody, 'runtimeTemplateId') ? bag.reqBody.runtimeTemplateId :
    null,
    (!_.has(bag.reqBody, 'privateSubnetId') || bag.reqBody.privateSubnetId === null) ?
      'NULL' : util.format('\'%s\'', bag.reqBody.privateSubnetId),
    (!_.has(bag.reqBody, 'publicNatIp') || bag.reqBody.publicNatIp === null) ?
      'NULL' : util.format('\'%s\'', bag.reqBody.publicNatIp));

  global.config.client.query(insertStatement,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to create systemMachineImage with error: ' +
            util.inspect(err))
        );

      return next();
    }
  );
}

function _getSystemMachineImage(bag, next) {
  var who = bag.who + '|' + _getSystemMachineImage.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemMachineImages" WHERE id=\'%s\'',
    bag.systemMachineImageId);

  global.config.client.query(query,
    function (err, systemMachineImages) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemMachineImage with error: ' + util.inspect(err))
        );

      if (_.isEmpty(systemMachineImages.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemMachineImage not found for id: ' + bag.systemMachineImageId)
        );

      logger.debug('Found systemMachineImage ' + bag.systemMachineImageId);

      bag.resBody = systemMachineImages.rows[0];
      return next();
    }
  );
}
