'use strict';

var self = post;
module.exports = self;

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

var envHandler = require('../../common/envHandler.js');
var VaultAdapter = require('../../common/VaultAdapter.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    vaultTokenEnv: 'VAULT_TOKEN'
  };

  bag.who = util.format('systemIntegrations|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getVaultURL.bind(null, bag),
      _getVaultToken.bind(null, bag),
      _getMasterIntegration.bind(null, bag),
      _enableMasterIntegration.bind(null, bag),
      _createSystemIntegration.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _postSystemIntegrationFieldsToVault.bind(null, bag)
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

  if (!_.has(bag.reqBody, 'name') || _.isEmpty(bag.reqBody.name))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data :name')
    );

  if (!_.has(bag.reqBody, 'masterName') || _.isEmpty(bag.reqBody.masterName))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data :masterName')
    );

  if (!_.has(bag.reqBody, 'data') || _.isEmpty(bag.reqBody.data))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data :data')
    );

  return next();
}

function _getVaultURL(bag, next) {
  var who = bag.who + '|' + _getVaultURL.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT "vaultUrl", secrets from "systemConfigs"';
  global.config.client.query(query,
    function (err, systemConfigs) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (!_.isEmpty(systemConfigs.rows) &&
        !_.isEmpty(systemConfigs.rows[0].vaultUrl)) {
        logger.debug('Found vault URL');

        bag.vaultUrl = systemConfigs.rows[0].vaultUrl;

        return next();
      }

      return next(
        new ActErr(who, ActErr.DataNotFound,
          'No vault URL found in configs')
      );
    }
  );
}

function _getVaultToken(bag, next) {
  var who = bag.who + '|' + _getVaultURL.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.vaultTokenEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.vaultTokenEnv)
        );

      if (_.isEmpty(value)) {
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No vault token found')
        );
      }

      logger.debug('Found vault token');
      bag.vaultToken = value;
      return next();
    }
  );
}

function _getMasterIntegration(bag, next) {
  var who = bag.who + '|' + _enableMasterIntegration.name;
  logger.verbose(who, 'Inside');

  var selectStatement = util.format('SELECT id FROM "masterIntegrations" ' +
    ' WHERE name=\'%s\' AND type=\'generic\'', bag.reqBody.masterName);

  global.config.client.query(selectStatement,
    function (err, masterIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );


      if (!_.isEmpty(masterIntegrations.rows) &&
        !_.isEmpty(masterIntegrations.rows[0])) {
        bag.masterIntegrationId = masterIntegrations.rows[0].id;
        return next();
      }

      return next(
        new ActErr(who, ActErr.DataNotFound,
          'No master integration found')
      );
    }
  );
}

function _enableMasterIntegration(bag, next) {
  var who = bag.who + '|' + _enableMasterIntegration.name;
  logger.verbose(who, 'Inside');

  var updateStatement = util.format('UPDATE "masterIntegrations" SET ' +
    '"isEnabled"=true WHERE id=\'%s\'', bag.masterIntegrationId);

  global.config.client.query(updateStatement,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      return next();
    }
  );
}

function _createSystemIntegration(bag, next) {
  var who = bag.who + '|' + _createSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.systemIntegrationId = mongoose.Types.ObjectId().toString();

  var insertStatement = util.format('INSERT INTO "systemIntegrations" ' +
    '("id", "name", "masterIntegrationId", "masterName", "isEnabled", ' +
    '"createdBy", "updatedBy", "createdAt", "updatedAt") ' +
    'values (\'%s\', \'%s\', \'%s\', \'%s\', true,' +
    ' \'54188262bc4d591ba438d62a\', \'54188262bc4d591ba438d62a\',' +
    ' \'2016-06-01\', \'2016-06-01\')',
    bag.systemIntegrationId, bag.reqBody.name, bag.masterIntegrationId,
    bag.reqBody.masterName);

  global.config.client.query(insertStatement,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      return next();
    }
  );
}

function _getSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemIntegrations" WHERE ' +
    '"id"=\'%s\'', bag.systemIntegrationId);

  global.config.client.query(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (!_.isEmpty(systemIntegrations.rows) &&
        !_.isEmpty(systemIntegrations.rows[0])) {
        bag.systemIntegration = systemIntegrations.rows[0];
        return next();
      }

      return next(
        new ActErr(who, ActErr.DataNotFound,
          'No system integration found')
      );
    }
  );
}

function _postSystemIntegrationFieldsToVault(bag, next) {
  var who = bag.who + '|' + _postSystemIntegrationFieldsToVault.name;
  logger.verbose(who, 'Inside');

  var vaultAdapter = new VaultAdapter(bag.vaultUrl, bag.vaultToken);

  var vaultSecret = {
    id: bag.systemIntegration.id,
    systemIntegrationId: bag.systemIntegration.systemIntegrationId,
    name: bag.systemIntegration.name,
    masterIntegrationId: bag.systemIntegration.masterIntegrationId,
    masterName: bag.systemIntegration.masterName,
    isEnabled: bag.systemIntegration.isEnabled,
    createdBy: bag.systemIntegration.createdBy,
    updatedBy: bag.systemIntegration.updatedBy,
    createdAt: bag.systemIntegration.createdAt,
    updatedAt: bag.systemIntegration.updatedAt,
    data: bag.reqBody.data
  };

  var key = util.format('shippable/systemIntegrations/%s',
    bag.systemIntegration.id);
  vaultAdapter.postSecret(key, vaultSecret,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to :postSecret for systemIntegrationId: ' +
            bag.systemIntegration.id + ' with status code ' + err, body)
        );

      bag.resBody = bag.systemIntegration;
      return next();
    }
  );
}
