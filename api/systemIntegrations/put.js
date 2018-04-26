'use strict';

var self = put;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');
var envHandler = require('../../common/envHandler.js');
var VaultAdapter = require('../../common/VaultAdapter.js');

function put(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    vaultUrlEnv: 'VAULT_URL',
    vaultTokenEnv: 'VAULT_TOKEN'
  };

  bag.who = util.format('systemIntegrations|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getSystemIntegration.bind(null, bag),
      _getVaultURL.bind(null, bag),
      _getVaultToken.bind(null, bag),
      _getMasterIntegrationFields.bind(null, bag),
      _validateMasterIntegrationFields.bind(null, bag),
      _postProvider.bind(null, bag),
      _put.bind(null, bag),
      _getUpdatedSystemIntegration.bind(null, bag),
      _postSystemIntegrationFieldsToVault.bind(null, bag),
      _putMasterIntegration.bind(null, bag)
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

  if (!bag.inputParams.systemIntegrationId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route param not found :systemIntegrationId')
    );

  return next();
}

function _getSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemIntegrations" WHERE id=\'%s\'',
    bag.inputParams.systemIntegrationId);

  global.config.client.query(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemIntegrations with error: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemIntegrations not found for id: ' +
             bag.inputParams.systemIntegrationId)
        );

      logger.debug('Found systemIntegrations for ' +
        bag.inputParams.systemIntegrationId);

      bag.systemIntegration = systemIntegrations.rows[0];
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

      if (_.isEmpty(value)) {
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No vault URL found')
        );
      }

      logger.debug('Found vault URL');
      bag.vaultUrl = value;
      return next();
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

function _getMasterIntegrationFields(bag, next) {
  var who = bag.who + '|' + _getMasterIntegrationFields.name;
  logger.verbose(who, 'Inside');

  var query = util.format('masterIntegrationIds=%s',
    bag.systemIntegration.masterIntegrationId);

  bag.apiAdapter.getMasterIntegrationFields(query,
    function (err, masterIntegrationFields) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to put master integration: ' + util.inspect(err))
        );

      bag.masterIntegrationFields = masterIntegrationFields;

      return next();
    }
  );
}

function _validateMasterIntegrationFields(bag, next) {
  var who = bag.who + '|' + _validateMasterIntegrationFields.name;
  logger.verbose(who, 'Inside');

  var errors = [];

  _.each(bag.masterIntegrationFields,
    function (miField) {
      if (miField.isRequired && !_.has(bag.reqBody.data, miField.name)) {
        errors.push(util.format('Missing field %s', miField.name));
        return;
      }

      var dataField = bag.reqBody.data[miField.name];

      if (_.has(bag.reqBody.data, miField.name) &&
        __checkDataType(dataField) !== miField.dataType)
        errors.push(util.format('%s is not a %s',
          miField.name, miField.dataType));

      // validate keyValuePair's masterIntegrationField envs
      if (bag.systemIntegration.masterName === 'keyValuePair' &&
        miField.name === 'envs' &&
        _.isObject(dataField)) {
        var validationResult = __validateKeys(dataField);
        if (!validationResult.isValid)
          errors = errors.concat(validationResult.errors);
      }
    }
  );

  if (errors.length)
    return next(
      new ActErr(who, ActErr.OperationFailed,
        util.format('Invalid systemIntegration data: %s', errors.join(', ')))
    );

  return next();
}

function _postProvider(bag, next) {
  var who = bag.who + '|' + _postProvider.name;
  logger.verbose(who, 'Inside');

  if (!bag.reqBody.data.url) {
    logger.debug(
      'No provider available for system integration: ' + bag.reqBody.name);
    return next();
  }

  // Strip 'Keys' from the end of the name
  // This is to deal with the fact that providers will be dynamically created
  // for auth providers when the system integration is created. The system
  // integrations are named "githubKeys", "bitbucketKeys', etc., whereas the
  // SCM account integrations are always named "github" and "bitbucket".
  var name = bag.reqBody.masterName;
  if (name.endsWith('Keys'))
    name = name.replace('Keys', '');
  var provider = {
    url: bag.reqBody.data.url,
    name: name
  };

  bag.apiAdapter.postProvider(provider,
    function (err, newProvider) {
      if (err)
        return next(
          new ActErr(who, err.id,
            'postProvider for masterIntegrationId: ' +
            bag.masterIntegration.id + ' returned an error: ', err)
        );
      bag.provider = newProvider;
      return next();
    }
  );
}

function _put(bag, next) {
  var who = bag.who + '|' + _put.name;
  logger.verbose(who, 'Inside');

  var updates = [];

  _.each(bag.reqBody,
    function (value, key) {
      if (key === 'data')
        return;

      if (_.isString(value))
        value = util.format('\'%s\'', value);

      updates.push(
        util.format('"%s"=%s', key, value)
      );
    }
  );

  updates = updates.join(', ');

  var query = util.format('UPDATE "systemIntegrations" SET %s WHERE id=\'%s\'',
    updates, bag.inputParams.systemIntegrationId);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to update systemIntegration with error: ' +
            util.inspect(err))
        );

      return next();
    }
  );
}

function _getUpdatedSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getUpdatedSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "systemIntegrations" WHERE id=\'%s\'',
    bag.inputParams.systemIntegrationId);

  global.config.client.query(query,
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get systemIntegrations with error: ' + util.inspect(err))
        );

      if (_.isEmpty(systemIntegrations.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'systemIntegrations not found for id: ' +
             bag.inputParams.systemIntegrationId)
        );

      logger.debug('Found systemIntegrations for ' +
        bag.inputParams.systemIntegrationId);

      bag.resBody = systemIntegrations.rows[0];
      return next();
    }
  );
}

function _postSystemIntegrationFieldsToVault(bag, next) {
  var who = bag.who + '|' + _postSystemIntegrationFieldsToVault.name;
  logger.verbose(who, 'Inside');

  var vaultAdapter = new VaultAdapter(bag.vaultUrl, bag.vaultToken);

  var vaultSecret = {
    id: bag.resBody.id,
    systemIntegrationId: bag.resBody.systemIntegrationId,
    name: bag.resBody.name,
    masterIntegrationId: bag.resBody.masterIntegrationId,
    masterName: bag.resBody.masterName,
    isEnabled: bag.resBody.isEnabled,
    createdBy: bag.resBody.createdBy,
    updatedBy: bag.resBody.updatedBy,
    createdAt: bag.resBody.createdAt,
    updatedAt: bag.resBody.updatedAt,
    data: bag.reqBody.data
  };

  if (bag.provider)
    vaultSecret.data.providerId = bag.provider.id;

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

      bag.resBody.data = bag.reqBody.data;
      return next();
    }
  );
}

function __checkDataType(data) {
  // these are the 4 data types supported in masterIntegrationFields
  if (_.isString(data))
    return 'string';
  if (_.isNumber(data))
    return 'number';
  if (_.isBoolean(data))
    return 'boolean';
  if (_.isObject(data)) {
    return 'object';
  }
}

function __validateKeys(keyValuePair) {
  var result = {
    isValid: true,
    errors: []
  };

  var invalidKeys = [];
  _.each(keyValuePair,
    function (value, key) {
      if (key.match(/([^a-zA-Z_0-9]|^\d)/)) {
        result.isValid = false;
        invalidKeys.push(key);
      }
    }
  );

  if (!_.isEmpty(invalidKeys))
    result.errors.push(
      util.format('Invalid keys: ' + invalidKeys.join(', ') +
        '. A key can contain only letters, digits and underscores, ' +
        'and may not start with a digit.')
    );

  return result;
}

function _putMasterIntegration(bag, next) {
  var who = bag.who + '|' + _putMasterIntegration.name;
  logger.verbose(who, 'Inside');

  var update = {
    isEnabled: true
  };

  bag.apiAdapter.putMasterIntegrationById(
    bag.systemIntegration.masterIntegrationId, update,
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
