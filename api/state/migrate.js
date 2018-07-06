'use strict';

var self = migrate;
module.exports = self;

var async = require('async');
var fs = require('fs-extra');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');
var configHandler = require('../../common/configHandler.js');

function migrate(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: [],
    res: res,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    skipStatusChange: false,
    params: {},
    component: 'state',
    tmpScript: '/tmp/state.sh'
  };

  bag.who = util.format('state|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _get.bind(null, bag),
      _getSystemIntegrations.bind(null, bag),
      _setProcessingFlag.bind(null, bag),
      _sendResponse.bind(null, bag),
      _getLastResourceId.bind(null, bag),
      _migrateResources.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (!bag.skipStatusChange)
        _setCompleteStatus(bag, err);

      if (err) {
        // only send a response if we haven't already
        if (!bag.isResponseSent)
          respondWithError(bag.res, err);
        else
          logger.warn(err);
      }
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _get(bag, next) {
  var who = bag.who + '|' + _get.name;
  logger.verbose(who, 'Inside');

  configHandler.get(bag.component,
    function (err, state) {
      if (err) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'Failed to get ' + bag.component, err)
        );
      }

      if (_.isEmpty(state)) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'No configuration in database for ' + bag.component)
        );
      }

      if (state.isFailed) {
        bag.skipStatusChange = true;
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'State has not been successfully initialized')
        );
      }

      bag.config = state;

      if (!bag.config.type)
        bag.config.type = 'gitlabCreds';

      return next();
    }
  );
}

function _getSystemIntegrations(bag, next) {
  var who = bag.who + '|' + _getSystemIntegrations.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('name=state',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get system integrations: ' + util.inspect(err))
        );

      if (systemIntegrations.length !== 2)
        return next();

      bag.currentSystemIntegration = _.findWhere(systemIntegrations,
        {masterName: bag.config.type});
      bag.previousSystemIntegration = _.find(systemIntegrations,
        function (integration) {
          return integration.masterName !== bag.config.type;
        }
      );

      return next();
    }
  );
}

function _setProcessingFlag(bag, next) {
  if (!bag.currentSystemIntegration || !bag.previousSystemIntegration)
    return next();
  var who = bag.who + '|' + _setProcessingFlag.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: true,
    isFailed: false
  };

  configHandler.put(bag.component, update,
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

function _sendResponse(bag, next) {
  var who = bag.who + '|' + _sendResponse.name;
  logger.verbose(who, 'Inside');

  // We reply early so the request won't time out while waiting.

  sendJSONResponse(bag.res, bag.resBody, 202);
  bag.isResponseSent = true;
  return next();
}

function _getLastResourceId(bag, next) {
  if (!bag.currentSystemIntegration || !bag.previousSystemIntegration)
    return next();
  var who = bag.who + '|' + _getLastResourceId.name;
  logger.verbose(who, 'Inside');

  var query = 'SELECT max(id) FROM resources;';
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to find last resource with error: ' + util.inspect(err))
        );

      if (!_.isEmpty(res.rows))
        bag.lastResourceId = res.rows[0].max;

      return next();
    }
  );
}

function _migrateResources(bag, next) {
  if (!bag.currentSystemIntegration || !bag.previousSystemIntegration)
    return next();
  var who = bag.who + '|' + _migrateResources.name;
  logger.verbose(who, 'Inside');

  var nextResourceId = 0;
  var logStream = fs.createWriteStream(
    global.config.runtimeDir + '/logs/state.log', {flags:'a'});

  logStream.write(util.format('Resources 1 to %s will be processed\n',
    bag.lastResourceId));

  async.whilst(
    function () {
      return nextResourceId <= bag.lastResourceId;
    },
    function (done) {
      var seriesBag = {
        nextResourceId: nextResourceId + 1,
        throughResourceId: _.min([nextResourceId + 50, bag.lastResourceId]),
        logStream: logStream,
        resources: []
      };
      async.series([
          _listResources.bind(null, seriesBag)
        ],
        function (err) {
          nextResourceId = nextResourceId + 50;
          return done(err);
        }
      );

    },
    function (err) {
      logStream.end();
      return next(err);
    }
  );
}

function _listResources(seriesBag, next) {
  seriesBag.logStream.write(util.format('Processing resources %s to %s\n',
    seriesBag.nextResourceId, seriesBag.throughResourceId));

  var query = util.format(
    'SELECT id,name FROM resources WHERE id BETWEEN %s AND %s;',
    seriesBag.nextResourceId, seriesBag.throughResourceId);
  global.config.client.query(query,
    function (err, res) {
      if (err)
        return next(
          new ActErr('_listResources', ActErr.OperationFailed,
            'Failed to find resources with error: ' + util.inspect(err))
        );

      seriesBag.resources = res.rows;
      return next();
    }
  );
}

function _setCompleteStatus(bag, err) {
  var who = bag.who + '|' + _setCompleteStatus.name;
  logger.verbose(who, 'Inside');

  var update = {
    isProcessing: false
  };
  if (err)
    update.isFailed = true;
  else
    update.isFailed = false;

  configHandler.put(bag.component, update,
    function (err) {
      if (err)
        logger.warn(err);
    }
  );
}
