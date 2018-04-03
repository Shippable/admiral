'use strict';

var self = put;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function put(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('systemMachineImages|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemMachineImage.bind(null, bag),
      _put.bind(null, bag),
      _getUpdatedSystemMachineImage.bind(null, bag)
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

  if (!bag.inputParams.systemMachineImageId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
      'Route parameter not found :systemMachineImageId')
    );

  return next();
}

function _getSystemMachineImage(bag, next) {
  var who = bag.who + '|' + _getSystemMachineImage.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemMachineImages" WHERE id=\'%s\'',
    bag.inputParams.systemMachineImageId);

  global.config.client.query(query,
    function (err, systemMachineImages) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemMachineImages with error: ' +
            util.inspect(err))
        );

      if (_.isEmpty(systemMachineImages.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemMachineImage not found for id: ' +
             bag.inputParams.systemMachineImageId)
        );

      logger.debug('Found systemMachineImage for ' +
        bag.inputParams.systemMachineImageId);

      bag.systemMachineImage = systemMachineImages.rows[0];
      return next();
    }
  );
}

function _put(bag, next) {
  /* jshint maxcomplexity:25 */
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  var updates = ['"updatedAt"=CURRENT_TIMESTAMP'];

  if (_.has(bag.reqBody, 'archTypeCode'))
    updates.push(util.format('"archTypeCode"=\'%s\'',
      bag.reqBody.archTypeCode));

  if (_.has(bag.reqBody, 'externalId'))
    updates.push(util.format('"externalId"=\'%s\'', bag.reqBody.externalId));

  if (_.has(bag.reqBody, 'provider'))
    updates.push(util.format('"provider"=\'%s\'', bag.reqBody.provider));

  if (_.has(bag.reqBody, 'name'))
    updates.push(util.format('"name"=\'%s\'', bag.reqBody.name));

  if (_.has(bag.reqBody, 'description'))
    updates.push(util.format('"description"=\'%s\'', bag.reqBody.description));

  if (_.has(bag.reqBody, 'isAvailable'))
    updates.push(util.format('"isAvailable"=\'%s\'', bag.reqBody.isAvailable));

  if (_.has(bag.reqBody, 'isDefault'))
    updates.push(util.format('"isDefault"=\'%s\'', bag.reqBody.isDefault));

  if (_.has(bag.reqBody, 'region'))
    updates.push(util.format('"region"=\'%s\'', bag.reqBody.region));

  if (_.has(bag.reqBody, 'keyName'))
    updates.push(util.format('"keyName"=\'%s\'', bag.reqBody.keyName));

  if (_.has(bag.reqBody, 'runShImage'))
    updates.push(util.format('"runShImage"=\'%s\'', bag.reqBody.runShImage));

  if (_.has(bag.reqBody, 'sshUser'))
    updates.push(util.format('"sshUser"=\'%s\'', bag.reqBody.sshUser));

  if (_.has(bag.reqBody, 'sshPort'))
    updates.push(util.format('"sshPort"=%s', bag.reqBody.sshPort));

  if (_.has(bag.reqBody, 'runtimeTemplateId'))
    updates.push(util.format('"runtimeTemplateId"=%s', bag.reqBody.runtimeTemplateId));

  if (_.has(bag.reqBody, 'securityGroup'))
    updates.push(
      util.format('"securityGroup"=\'%s\'', bag.reqBody.securityGroup));

  if (_.has(bag.reqBody, 'subnetId')) {
    if (bag.reqBody.subnetId === null)
      updates.push('"subnetId"=NULL');
    else
      updates.push(util.format('"subnetId"=\'%s\'', bag.reqBody.subnetId));
  }

  if (_.has(bag.reqBody, 'drydockTag'))
    updates.push(util.format('"drydockTag"=\'%s\'', bag.reqBody.drydockTag));

  if (_.has(bag.reqBody, 'drydockFamily'))
    updates.push(
      util.format('"drydockFamily"=\'%s\'', bag.reqBody.drydockFamily));

  updates = updates.join(', ');

  var query = util.format('UPDATE "systemMachineImages" SET %s WHERE id=\'%s\'',
    updates, bag.inputParams.systemMachineImageId);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update systemMachineImage with error: ' +
            util.inspect(err))
        );

      return next();
    }
  );
}

function _getUpdatedSystemMachineImage(bag, next) {
  var who = bag.who + '|' + _getUpdatedSystemMachineImage.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemMachineImages" WHERE id=\'%s\'',
    bag.inputParams.systemMachineImageId);

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
            'systemMachineImages not found for id: ' +
             bag.inputParams.systemMachineImageId)
        );

      logger.debug('Found systemMachineImages for ' +
        bag.inputParams.systemMachineImageId);

      bag.resBody = systemMachineImages.rows[0];
      return next();
    }
  );
}
