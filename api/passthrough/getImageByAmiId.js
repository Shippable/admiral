'use strict';

var self = getImageByAmiId;
module.exports = self;

var async = require('async');
var _ = require('underscore');

var AWSAdapter = require('../../common/awsAdapter.js');

function getImageByAmiId(req, res) {
  var bag = {
    reqQuery: req.query,
    accessToken: req.query.accessToken,
    secretToken: req.query.secretToken,
    region: req.query.region || 'us-east-1',
    amiId: req.params.id,
    resBody: {},
    awsAdapter: null
  };

  bag.who = util.format('getImageByAmiId|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
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

  if (!bag.accessToken)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Query parameter not found :accessToken')
    );

  if (!bag.secretToken)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Query parameter not found :secretToken')
    );

  if (!bag.amiId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route parameter not found :amiId')
    );

  return next();
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
