'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var configHandler = require('../../common/configHandler.js');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    initializeDefault: false,
    component: 'services',
    defaultService: {}
  };

  bag.who = util.format('services|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _get.bind(null, bag),
    _getServicesJson.bind(null, bag),
    _setDefault.bind(null, bag),
    _getDefaultServices.bind(null, bag)
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

  if (bag.reqQuery.name)
    bag.serviceQuery = bag.reqQuery.name;

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, services) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component, err)
        );

      if (_.isEmpty(services)) {
        logger.debug('No configuration in database for ' + bag.component);
        bag.initializeDefault = true;
        return next();
      }

      if (!bag.serviceQuery) {
        _.each(services,
          function (service) {
            bag.resBody.push(service);
          }
        );
      } else if (_.has(services, bag.serviceQuery)) {
        bag.resBody.push(services[bag.serviceQuery]);
      }

      return next();
    }
  );
}

function _getServicesJson(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _getServicesJson.name;
  logger.verbose(who, 'Inside');

  var servicesJsonPath =
    path.join(global.config.scriptsDir, '/configs/services.json');

  fs.readFile(servicesJsonPath,
    function (err, data) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get services.json: ' + util.inspect(err))
        );

      var error;

      try {
        bag.services = JSON.parse(data);
      } catch (err) {
        if (err)
          error = new ActErr(who, ActErr.OperationFailed,
            util.format('Failed to parse services.json: %s', err)
          );
      }

      return next(error);
    }
  );
}

function _setDefault(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _setDefault.name;
  logger.verbose(who, 'Inside');

  _.each(bag.services.serviceConfigs,
    function (service) {
      bag.defaultService[service.name] = {
        serviceName: service.name,
        isCore: service.isCore,
        replicas: service.isGlobal ? 'global' : 1,
        isEnabled: false,
        apiUrlIntegration: service.apiUrlIntegration || 'api'
      };
    }
  );

  configHandler.put(bag.component, bag.defaultService,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to update config for ' + bag.component, err)
        );

      return next();
    }
  );
}

function _getDefaultServices(bag, next) {
  if (!bag.initializeDefault) return next();

  var who = bag.who + '|' + _getDefaultServices.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, services) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get ' + bag.component, err)
        );

      if (!bag.serviceQuery) {
        _.each(services,
          function (service) {
            bag.resBody.push(service);
          }
        );
      } else if (_.has(services, bag.serviceQuery)) {
        bag.resBody.push(services[bag.serviceQuery]);
      }

      return next();
    }
  );
}
