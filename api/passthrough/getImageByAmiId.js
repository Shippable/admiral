'use strict';

var self = getImageByAmiId;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var AWSAdapter = require('../../common/awsAdapter.js');
var APIAdapter = require('../../common/APIAdapter.js');

function getImageByAmiId(req, res) {
  var bag = {
    reqQuery: req.query,
    accessToken: null,
    secretToken: null,
    region: req.query.region || 'us-east-1',
    amiId: req.params.id,
    systemIntegration: {},
    apiAdapter: new APIAdapter(req.headers.authorization.split(' ')[1]),
    resBody: {},
    awsAdapter: null
  };

  bag.who = util.format('getImageByAmiId|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _getProvisionSystemIntegration.bind(null, bag),
    _initializeAWSAdapter.bind(null, bag),
    _getImageFromAmiId.bind(null, bag)
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

  if (!bag.amiId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route parameter not found :amiId')
    );

  return next();
}

function _getProvisionSystemIntegration(bag, next) {
  var who = bag.who + '|' + _getProvisionSystemIntegration.name;
  logger.verbose(who, 'Inside');

  var query = 'name=provision&masterName=amazonKeys';
  bag.apiAdapter.getSystemIntegrations(query,
    function (err, systemIntegrations) {
      if (err)
        return next(err);

      if (!systemIntegrations.length) 
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'No provision systemIntegration found: ')
        );

      bag.systemIntegration = systemIntegrations[0];
      if (bag.systemIntegration && bag.systemIntegration.data) {
        bag.accessToken = bag.systemIntegration.data.accessKey;
        bag.secretToken = bag.systemIntegration.data.secretKey;
      }

      return next();
    }
  );
}

function _initializeAWSAdapter(bag, next) {
  var who = bag.who + '|' + _initializeAWSAdapter.name;
  logger.verbose(who, 'Inside');

  bag.awsAdapter = new AWSAdapter(bag.accessToken, bag.secretToken, bag.region);

  bag.awsAdapter.initialize(
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Initialize awsAdapter returned error: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _getImageFromAmiId(bag, next) {
  var who = bag.who + '|' + _getImageFromAmiId.name;
  logger.verbose(who, 'Inside');

  bag.awsAdapter.EC2.getImages(bag.amiId,
    function (err, images) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Adapter call failed for EC2.getImages',
            util.inspect(err))
        );

      var imgId = _.first(_.pluck(images, 'ImageId'));
      bag.resBody = { imageId: imgId };
      return next();
    }
  );
}
