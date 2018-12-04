'use strict';

var self = validateSysIntBaseUrl;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var APIAdapter = require('../../common/APIAdapter.js');

var validateBaseUrl = {
  gitlabKeys: require('../../common/gitlab/validateBaseUrl.js'),
  bitbucketServerKeys: require(
    '../../common/bitbucketServer/validateBaseUrl.js'),
  bitbucketServerBasicAuth: require(
    '../../common/bitbucketServer/validateBaseUrl.js'),
  gerritBasicAuth: require(
    '../../common/gerrit/validateBaseUrl.js'),
  githubEnterpriseKeys: require('../../common/ghe/validateBaseUrl.js')
};

function validateSysIntBaseUrl(req, res) {
  var bag = {
    inputParams: req.params,
    reqBody: req.body,
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    resBody: {}
  };

  bag.who = util.format('systemIntegrations|%s',
    self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _getById.bind(null, bag),
      _validateBaseUrl.bind(null, bag)
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

  if (!bag.reqBody)
    return next(new ActErr(who, ActErr.BodyNotFound, 'Missing body'));

  if (!bag.reqBody.url)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :url')
    );

  bag.url = bag.reqBody.url;

  return next();
}

function _getById(bag, next) {
  var who = bag.who + '|' + _getById.name;
  logger.verbose(who, 'Inside');

  bag.apiAdapter.getSystemIntegrations('',
    function (err, systemIntegrations) {
      if (err)
        return next(
          new ActErr(who, err.id,
            'getSystemIntegrationById failed for :id ' +
            bag.systemIntegrationId)
        );
      var sysInt = _.findWhere(systemIntegrations,
      {id: bag.systemIntegrationId});
      if (!sysInt)
        return next(
          new ActErr(who, ActErr.DataNotFound,
            'systemIntegration not found for id: ' +
            bag.inputParams.systemIntegrationId)
        );

      bag.systemIntegration = sysInt;

      return next();
    }
  );
}

function _validateBaseUrl(bag, next) {
  var who = bag.who + '|' + _validateBaseUrl.name;
  logger.verbose(who, 'Inside');

  var urlValidationStategy = validateBaseUrl[bag.systemIntegration.masterName];
  if (!urlValidationStategy)
    return next(
      new ActErr(who, ActErr.OperationFailed,
        'No validation strategy for provider ' +
        bag.systemIntegration.masterName)
    );

  urlValidationStategy(bag.url, bag.systemIntegration.masterName,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Invalid base url for provider: ' +
            bag.systemIntegration.masterName)
        );

      var message = util.format('%s is a valid %s endpoint url',
        bag.url, bag.systemIntegration.masterName);
      bag.resBody = message;
      return next();
    }
  );
}
