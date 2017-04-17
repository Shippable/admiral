'use strict';

var self = post;
module.exports = self;

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');
var envHandler = require('../../common/envHandler.js');
var VaultAdapter = require('../../common/VaultAdapter.js');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
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
      _getMasterIntegrationFields.bind(null, bag),
      _validateMasterIntegrationFields.bind(null, bag),
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

  var selectStatement = util.format('SELECT * FROM "masterIntegrations" ' +
    ' WHERE name=\'%s\' AND type=\'generic\'', bag.reqBody.masterName);

  global.config.client.query(selectStatement,
    function (err, masterIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (!_.isEmpty(masterIntegrations.rows) &&
        !_.isEmpty(masterIntegrations.rows[0])) {
        bag.masterIntegration = masterIntegrations.rows[0];
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

  var update = {
    isEnabled: true
  };

  bag.apiAdapter.putMasterIntegrationById(bag.masterIntegration.id, update,
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
    bag.systemIntegrationId, bag.reqBody.name, bag.masterIntegration.id,
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

function _getMasterIntegrationFields(bag, next) {
  var who = bag.who + '|' + _getMasterIntegrationFields.name;
  logger.verbose(who, 'Inside');

  var query = util.format('masterIntegrationIds=%s', bag.masterIntegration.id);

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
      if (bag.masterIntegration.name === 'keyValuePair' &&
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
