'use strict';

var self = getS;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function getS(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    initializeDefault: false
  };

  bag.who = util.format('vault|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _getS.bind(null, bag),
    _setDefault.bind(null, bag)
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

function _getS(bag, next) {
  var who = bag.who + '|' + _getS.name;
  logger.verbose(who, 'Inside');

  global.config.client.query('SELECT vault from "systemConfigs"',
    function (err, systemConfigs) {
      if (err)
        return next(new ActErr(who, ActErr.DataNotFound, err));
      if (!_.isEmpty(systemConfigs.rows) &&
        !_.isEmpty(systemConfigs.rows[0].vault)) {
          logger.debug('Found vault configuration');

          var vaultConfig = systemConfigs.rows[0].vault;
          bag.resBody = [JSON.parse(vaultConfig)];
      } else {
        logger.debug('No vault configuration present in configs');
        bag.initializeDefault = true;
      }

      return next();
    }
  );
}

function _setDefault(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _setDefault.name;
  logger.verbose(who, 'Inside');

  var vaultDefault = {
    address: '127.0.0.1.foo',
    rootToken: '',
    isInstalled: false,
    isInitialized: false
  };

  vaultDefault = JSON.stringify(vaultDefault);
  var query =
    util.format('UPDATE "systemConfigs" set "vault"=\'%s\';', vaultDefault);

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(new ActErr(who, ActErr.DBOperationFailed, err));

      if (response.rowCount === 1) {
        logger.debug('Successfully added default value for vault server');
        bag.resBody = [JSON.parse(vaultDefault)];
      } else {
        logger.warn('Failed to det default vault server value');
      }

      return next();
    }
  );
}
