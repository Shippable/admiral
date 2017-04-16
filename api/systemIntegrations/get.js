'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var envHandler = require('../../common/envHandler.js');
var VaultAdapter = require('../../common/VaultAdapter.js');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    systemIntegrations: [],
    resBody: [],
    vaultTokenEnv: 'VAULT_TOKEN'
  };

  bag.who = util.format('systemIntegrations|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getVaultURL.bind(null, bag),
      _getVaultToken.bind(null, bag),
      _constructQuery.bind(null, bag),
      _getSystemIntegrations.bind(null, bag),
      _getValuesFromVault.bind(null, bag)
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

        if (bag.vaultUrl.indexOf('http') !== 0)
          bag.vaultUrl = 'http://' + bag.vaultUrl;

        if (systemConfigs.rows[0].secrets) {
          var secretsConfig = JSON.parse(systemConfigs.rows[0].secrets);
          bag.vaultUrl = bag.vaultUrl + ':' + secretsConfig.port;
        }
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

function _constructQuery(bag, next) {
  var who = bag.who + '|' + _constructQuery.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT * FROM "systemIntegrations"';
  var queries = [];

  if (_.has(bag.reqQuery, 'name'))
    queries.push(util.format('name=\'%s\'', bag.reqQuery.name));

  if (_.has(bag.reqQuery, 'masterName'))
    queries.push(util.format('"masterName"=\'%s\'', bag.reqQuery.masterName));

  if (queries.length)
    query = query + ' WHERE ' + queries.join(' AND ');

  bag.query = query;
  return next();
}

function _getSystemIntegrations(bag, next) {
  var who = bag.who + '|' + _getSystemIntegrations.name;
  logger.verbose(who, 'Inside');

  global.config.client.query(bag.query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (systemIntegrations.rows)
        bag.systemIntegrations = systemIntegrations.rows;

      return next();
    }
  );
}

function _getValuesFromVault(bag, next) {
  var who = bag.who + '|' + _getValuesFromVault.name;
  logger.verbose(who, 'Inside');

  var vaultAdapter = new VaultAdapter(bag.vaultUrl, bag.vaultToken);

  async.eachLimit(bag.systemIntegrations, 10,
    function (sysInt, nextSysInt) {
      var key = util.format('shippable/systemIntegrations/%s', sysInt.id);
      vaultAdapter.getSecret(key,
        function (err, body) {
          if (err)
            return nextSysInt(
              new ActErr(who, ActErr.OperationFailed,
                'Failed to :getSecret for systemIntegrationId: ' +
                sysInt.id + ' with status code ' + err, body)
            );

          sysInt.data = body.data.data || {};
          bag.resBody.push(sysInt);
          return nextSysInt();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}
