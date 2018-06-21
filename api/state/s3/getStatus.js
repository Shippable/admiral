'use strict';

var self = getStatus;
module.exports = self;

var async = require('async');

var AWSAdapter = require('../../../common/awsAdapter.js');

function getStatus(params, callback) {
  var bag = {
    systemIntegration: params.systemIntegration,
    rootS3Bucket: params.rootS3Bucket,
    resBody: {
      isReachable: false,
      error: null
    },
    awsAdapter: null
  };

  bag.who = util.format('state|s3|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _initializeAWSAdapter.bind(null, bag),
      _checkRootBucket.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');

      return callback(err, bag.resBody);
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
        bag.resBody.error = 'Failed to intialize AWS adapter with error ' +
          util.inspect(err);

      return next();
    }
  );
}

function _checkRootBucket(bag, next) {
  if (bag.resBody.error) return next();
  var who = bag.who + '|' + _checkRootBucket.name;
  logger.debug(who, 'Inside');

  bag.awsAdapter.S3.checkBucket(bag.rootS3Bucket,
    function (err) {
      if (err) {
        if (err.code === 'NotFound')
          bag.resBody.error = 'Root bucket not available';
        else
          bag.resBody.error = 'Checking root bucket returned error: ' +
            util.inspect(err);
        return next();
      }

      bag.resBody.isReachable = true;
      return next();
    }
  );
}
