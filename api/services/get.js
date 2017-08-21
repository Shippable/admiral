'use strict';

var self = get;
module.exports = self;

var async = require('async');
var _ = require('underscore');
var configHandler = require('../../common/configHandler.js');

function get(req, res) {
  var bag = {
    reqQuery: req.query,
    resBody: [],
    initializeDefault: false,
    component: 'services',
    defaultService: {},
    services: require('../../common/scripts/configs/services.json')
  };

  bag.who = util.format('services|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _get.bind(null, bag),
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

function _setDefault(bag, next) {
  if (bag.serviceQuery) return next();

  var who = bag.who + '|' + _setDefault.name;
  logger.verbose(who, 'Inside');

  _.each(bag.services.serviceConfigs,
    function (service) {
      if (_.findWhere(bag.resBody, {serviceName: service.name}))
        bag.defaultService[service.name] =
          _.findWhere(bag.resBody, {serviceName: service.name});
      else
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
  if (bag.serviceQuery) return next();

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
