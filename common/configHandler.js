'use strict';

var self = configHandler;
module.exports = self;

var _ = require('underscore');
var async = require('async');

function configHandler() {}

configHandler.get = function (component, cb) {

  var query = util.format('SELECT %s from "systemSettings"', component);
  global.config.client.query(query,
    function (err, systemSettings) {
      if (err) {
        if (err.code === '42P01')
          return cb(
            new ActErr(self, ActErr.DataNotFound,
              'SystemSettings table not created. Please initialize.')
          );

        return cb(
          new ActErr(self, ActErr.DBOperationFailed,
            'Failed to get ' + component + ' with error ' + util.format(err)
          )
        );
      }

      var result = {};

      if (!_.isEmpty(systemSettings.rows) &&
        !_.isEmpty(systemSettings.rows[0][component])) {
        logger.debug('Found configuration for ' + component);
        var config = systemSettings.rows[0][component];
        result = JSON.parse(config);
      }

      return cb(null, result);
    }
  );
};

configHandler.put = function (component, update, cb) {

  var bag = {
    component: component,
    update: update,
    config: {}
  };

  async.series([
      _getConfigs.bind(null, bag),
      _updateConfigs.bind(null, bag)
    ],
    function (err) {
      if (err)
        return cb(err);
      return cb(null, bag.update);
    }
  );
};

function _getConfigs(bag, next) {

  configHandler.get(bag.component,
    function (err, config) {
      if (err)
        return next(
          new ActErr(self, err.id || ActErr.DBOperationFailed,
            'Failed to get config for component: ' + bag.component, err)
        );

      if (!_.isArray(bag.update)) {
        bag.update = _.extend(config, bag.update);
      }

      return next();
    }
  );
}

function _updateConfigs(bag, next) {

  var query = util.format('UPDATE "systemSettings" set %s=\'%s\';',
    bag.component, JSON.stringify(bag.update));

  global.config.client.query(query,
    function (err, response) {
      if (err)
        return next(err);

      if (response.rowCount === 1)
        logger.debug('Successfully updated configs');
      else
        return next(
          new ActErr(self, ActErr.DBOperationFailed,
            'Failed to update config for component: ' + bag.component)
        );

      return next();
    }
  );
}
