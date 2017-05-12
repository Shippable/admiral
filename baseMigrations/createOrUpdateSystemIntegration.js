'use strict';

module.exports = createOrUpdateSystemIntegration;

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');
var url = require('url');

var VaultAdapter = require('../common/VaultAdapter.js');

function createOrUpdateSystemIntegration(
  postgresClient, vaultUrl, vaultToken, systemIntegration, callback) {
  var bag = {
    postgresClient: postgresClient,
    systemIntegration: systemIntegration,
    vaultUrl: vaultUrl,
    vaultToken: vaultToken,
    systemIntegrationId: null,
    providerId: null
  };

  bag.who = util.format('migrate|%s', createOrUpdateSystemIntegration.name);

  async.series([
      _getSystemIntegration.bind(null, bag),
      _getMasterIntegration.bind(null, bag),
      _createSystemIntegration.bind(null, bag),
      _getExistingProvider.bind(null, bag),
      _createProvider.bind(null, bag),
      _getUpdatedSystemIntegration.bind(null, bag),
      _postSystemIntegrationFieldsToVault.bind(null, bag),
      _enableMasterIntegration.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      return callback(err);
    }
  );
}

function _getSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * from "systemIntegrations" ' +
    'WHERE name=\'%s\' AND "masterName"=\'%s\';',
    bag.systemIntegration.name, bag.systemIntegration.masterName);

  bag.postgresClient.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get systemIntegration with error: ' + util.inspect(err))
        );

      if (!_.isEmpty(res.rows))
        bag.systemIntegrationId = res.rows[0].id;

      return next();
    }
  );
}

function _getMasterIntegration(bag, next) {
  if (bag.systemIntegrationId) return next();

  var who = bag.who + '|' + _getMasterIntegration.name;
  logger.verbose(who, 'Inside');

  var selectStatement = util.format('SELECT * FROM "masterIntegrations" ' +
    ' WHERE name=\'%s\'', bag.systemIntegration.masterName);

  bag.postgresClient.query(selectStatement,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get masterIntegrations with error: ' + util.inspect(err))
        );

      if (_.isEmpty(res.rows) || _.isEmpty(res.rows[0]))
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No master integration found for name ' +
            bag.systemIntegration.masterName)
        );

      bag.systemIntegration.masterIntegrationId = res.rows[0].id;
      return next();
    }
  );
}

function _createSystemIntegration(bag, next) {
  if (bag.systemIntegrationId) return next();

  var who = bag.who + '|' + _createSystemIntegration.name;
  logger.verbose(who, 'Inside');

  bag.systemIntegrationId = mongoose.Types.ObjectId().toString();

  var insertStatement = util.format('INSERT INTO "systemIntegrations" ' +
    '("id", "name", "masterIntegrationId", "masterName", "isEnabled", ' +
    '"createdBy", "updatedBy", "createdAt", "updatedAt") ' +
    'values (\'%s\', \'%s\', \'%s\', \'%s\', true,' +
    ' \'54188262bc4d591ba438d62a\', \'54188262bc4d591ba438d62a\',' +
    ' \'2016-06-01\', \'2016-06-01\')',
    bag.systemIntegrationId, bag.systemIntegration.name,
    bag.systemIntegration.masterIntegrationId,
    bag.systemIntegration.masterName);

  bag.postgresClient.query(insertStatement,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to create systemIntegration with error: ' +
            util.inspect(err))
        );

      return next();
    }
  );
}

function _getExistingProvider(bag, next) {
  if (!bag.systemIntegration.data.url) return next();

  var who = bag.who + '|' + _getExistingProvider.name;
  logger.verbose(who, 'Inside');

  var providerUrl = bag.systemIntegration.data.url.
    toLowerCase().replace(/\/+$/, '');

  var query = util.format('SELECT * FROM "providers" WHERE "url"=\'%s\'',
    providerUrl);

  bag.postgresClient.query(query,
    function (err, providers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to find providers with error: ' + util.inspect(err))
        );

      if (!_.isEmpty(providers.rows) && !_.isEmpty(providers.rows[0]))
        bag.providerId = providers.rows[0];

      return next();
    }
  );
}

function _createProvider(bag, next) {
  if (!bag.systemIntegration.data.url) return next();
  if (bag.providerId) return next();

  var who = bag.who + '|' + _createProvider.name;
  logger.verbose(who, 'Inside');

  var retryOpts = {times: 4};

  bag.providerId = mongoose.Types.ObjectId().toString();

  var urlHostname =
    url.parse(bag.systemIntegration.data.url, true, true).hostname;
  var urlSlug = urlHostname;
  var providerUrl = bag.systemIntegration.data.url.
    toLowerCase().replace(/\/+$/, '');

  var name = bag.systemIntegration.masterName;
  if (name.endsWith('Keys'))
    name = name.replace('Keys', '');

  async.retry(retryOpts,
    function (callback) {

      var insertStatement = util.format('INSERT INTO "providers" ' +
        '("id", "url", "name", "urlSlug", ' +
        '"createdAt", "updatedAt") ' +
        'values (\'%s\', \'%s\', \'%s\', \'%s\',' +
        ' \'2016-06-01\', \'2016-06-01\')',
        bag.providerId, providerUrl, name, urlSlug);

      bag.postgresClient.query(insertStatement,
        function (err) {
          if (err) {
            // 23505 is duplicate key error
            if (err.code === '23505') {
              urlSlug = urlHostname + '-';
              var possible = 'abcdefghijklmnopqrstuvwxyz';
              for (var i = 0; i < 2; i++) {
                urlSlug +=
                  possible.charAt(Math.floor(Math.random() * possible.length));
              }
              return callback(err);
            } else {
              return callback(
                new ActErr(who, ActErr.DBOperationFailed,
                  'Failed to create provider with error: ' + util.inspect(err))
              );
            }
          }
          return callback();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _getUpdatedSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getUpdatedSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemIntegrations" WHERE id=\'%s\'',
    bag.systemIntegrationId);

  bag.postgresClient.query(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemIntegrations with error: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemIntegration not found for id: ' +
            bag.systemIntegrationId)
        );

      bag.updatedSystemIntegration = systemIntegrations.rows[0];
      return next();
    }
  );
}

function _postSystemIntegrationFieldsToVault(bag, next) {
  var who = bag.who + '|' + _postSystemIntegrationFieldsToVault.name;
  logger.verbose(who, 'Inside');

  var vaultAdapter = new VaultAdapter(bag.vaultUrl, bag.vaultToken);

  var vaultSecret = {
    id: bag.updatedSystemIntegration.id,
    systemIntegrationId: bag.updatedSystemIntegration.systemIntegrationId,
    name: bag.updatedSystemIntegration.name,
    masterIntegrationId: bag.updatedSystemIntegration.masterIntegrationId,
    masterName: bag.updatedSystemIntegration.masterName,
    isEnabled: bag.updatedSystemIntegration.isEnabled,
    createdBy: bag.updatedSystemIntegration.createdBy,
    updatedBy: bag.updatedSystemIntegration.updatedBy,
    createdAt: bag.updatedSystemIntegration.createdAt,
    updatedAt: bag.updatedSystemIntegration.updatedAt,
    data: bag.systemIntegration.data
  };

  if (bag.providerId)
    vaultSecret.data.providerId = bag.providerId;

  var key = util.format('shippable/systemIntegrations/%s',
    bag.updatedSystemIntegration.id);
  vaultAdapter.postSecret(key, vaultSecret,
    function (err, body) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to :postSecret for systemIntegrationId: ' +
            bag.updatedSystemIntegration.id + ' with status code ' + err, body)
        );

      return next();
    }
  );
}

function _enableMasterIntegration(bag, next) {
  var who = bag.who + '|' + _enableMasterIntegration.name;
  logger.verbose(who, 'Inside');

  var query = util.format(
    'UPDATE "masterIntegrations" SET "isEnabled"=true WHERE "name"=\'%s\';',
    bag.systemIntegration.masterName);

  bag.postgresClient.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to enable masterIntegration with error: ' +
            util.inspect(err))
        );

      return next();
    }
  );
}
