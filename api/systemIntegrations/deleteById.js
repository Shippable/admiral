'use strict';

var self = deleteById;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var APIAdapter = require('../../common/APIAdapter.js');
var envHandler = require('../../common/envHandler.js');
var VaultAdapter = require('../../common/VaultAdapter.js');

function deleteById(req, res) {
  var bag = {
    inputParams: req.params,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    vaultUrlEnv: 'VAULT_URL',
    vaultTokenEnv: 'VAULT_TOKEN'
  };

  bag.who = util.format('systemIntegrations|%s| ' +
    'systemIntegrationId:%s', self.name,
    bag.inputParams.systemIntegrationId);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemIntegrationById.bind(null, bag),
      _getVaultURL.bind(null, bag),
      _getVaultToken.bind(null, bag),
      _deleteById.bind(null, bag),
      _deleteByIdInVault.bind(null, bag),
      _getSystemIntegrations.bind(null, bag),
      _disableMasterIntegration.bind(null, bag)
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

  if (!bag.inputParams.systemIntegrationId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route parameter not found :systemIntegrationId')
    );
  bag.systemIntegrationId = bag.inputParams.systemIntegrationId;
  return next();
}

function _getSystemIntegrationById(bag, next) {
  var who = bag.who + '|' + _getSystemIntegrationById.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemIntegrations" WHERE id=\'%s\'',
    bag.systemIntegrationId);

  global.config.client.query(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (systemIntegrations.rows)
        bag.deletedSystemIntegration = _.first(systemIntegrations.rows);

      return next();
    }
  );
}

function _getVaultURL(bag, next) {
  var who = bag.who + '|' + _getVaultURL.name;
  logger.verbose(who, 'Inside');

  envHandler.get(bag.vaultUrlEnv,
    function (err, value) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Cannot get env: ' + bag.vaultUrlEnv)
        );

      if (_.isEmpty(value))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No vault URL found')
        );

      logger.debug('Found vault URL');
      bag.vaultUrl = value;
      return next();
    }
  );
}

function _getVaultToken(bag, next) {
  var who = bag.who + '|' + _getVaultToken.name;
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

function _deleteById(bag, next) {
  var who = bag.who + '|' + _deleteById.name;
  logger.verbose(who, 'Inside');

  var query =
    util.format('DELETE from "systemIntegrations" where id=\'%s\';',
      bag.systemIntegrationId);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'systemIntegrations.delete failed for id: ' +
            bag.systemIntegrationId + ' returned error: ' + err.message)
        );

      return next();
    }
  );
}

function _deleteByIdInVault(bag, next) {
  var who = bag.who + '|' + _deleteByIdInVault.name;
  logger.verbose(who, 'Inside');

  var vaultUrl = bag.vaultUrl;
  var shippableVaultToken = bag.vaultToken;
  var vaultAdapter = new VaultAdapter(vaultUrl, shippableVaultToken);

  var key = util.format('shippable/systemIntegrations/%s',
    bag.inputParams.systemIntegrationId);
  vaultAdapter.deleteSecret(key,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to :deleteSecret for systemIntegrationId: ' +
            bag.inputParams.systemIntegrationId + ' with status code ' + err,
            body)
        );

      return next();
    }
  );
}

function _getSystemIntegrations(bag, next) {
  var who = bag.who + '|' + _getSystemIntegrations.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "systemIntegrations"';

  global.config.client.query(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (systemIntegrations.rows)
        bag.systemIntegrations = systemIntegrations.rows;

      bag.masterIntInUse = _.findWhere(
        bag.systemIntegrations,
        {masterIntegrationId: bag.deletedSystemIntegration.masterIntegrationId}
      );

      return next();
    }
  );
}

function _disableMasterIntegration(bag, next) {
  if (bag.masterIntInUse) return next();

  var who = bag.who + '|' + _disableMasterIntegration.name;
  logger.verbose(who, 'Inside');

  var update = {
    isEnabled: false
  };

  bag.apiAdapter.putMasterIntegrationById(
    bag.deletedSystemIntegration.masterIntegrationId, update,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to put master integration: ' + util.inspect(err))
        );

      return next();
    }
  );
}
