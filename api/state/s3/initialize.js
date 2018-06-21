'use strict';

var self = initialize;
module.exports = self;

var async = require('async');

var AWSAdapter = require('../../../common/awsAdapter.js');

function initialize(params, callback) {
  var bag = {
    config: params.config,
    systemIntegration: params.systemIntegration,
    rootS3Bucket: params.rootS3Bucket
  };

  bag.who = util.format('state|s3|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _initializeAWSAdapter.bind(null, bag),
      _checkRootBucket.bind(null, bag),
      _createRootBucket.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return callback(err);

      return callback();
    }
  );
}

function _checkInputParams(bag, next) {
  var who = bag.who + '|' + _checkInputParams.name;
  logger.verbose(who, 'Inside');

  return next();
}

function _initializeAWSAdapter(bag, next) {
  var who = bag.who + '|' + _initializeAWSAdapter.name;
  logger.verbose(who, 'Inside');

  bag.awsAdapter = new AWSAdapter(bag.systemIntegration.data.accessKey,
    bag.systemIntegration.data.secretKey, 'us-east-1');

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

function _checkRootBucket(bag, next) {
  var who = bag.who + '|' + _checkRootBucket.name;
  logger.debug(who, 'Inside');

  bag.awsAdapter.S3.checkBucket(bag.rootS3Bucket,
    function (err) {
      if (err) {
        if (err.code === 'NotFound')
          return next();
        else
          return next(
            new ActErr(who, ActErr.OperationFailed,
              'Checking root bucket returned error: ' + util.inspect(err))
          );
      }

      bag.bucketExists = true;
      return next();
    }
  );
}

function _createRootBucket(bag, next) {
  if (bag.bucketExists) return next();
  var who = bag.who + '|' + _createRootBucket.name;
  logger.debug(who, 'Inside');

  bag.awsAdapter.S3.createBucket(bag.rootS3Bucket,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Creating root bucket returned error: ' + util.inspect(err))
        );

      return next();
    }
  );
}
