'use strict';

var self = Adapter;
module.exports = self;

var AWS = require('aws-sdk');
var proxy = require('proxy-agent');
var _ = require('underscore');
var EC2 = {};

function Adapter(accessKeyId, secretKey, region, sessionToken) {
  this.config = {};
  this.aws_access_key_id = accessKeyId;
  this.aws_secret_access_key = secretKey;
  this.region = region || 'us-east-1';
  this.sessionToken = sessionToken;
  this.apiVersions = '2015-02-01';
  this.initialized = false;

  /* jshint camelcase: false */
  var proxyAddress = process.env.https_proxy || process.env.http_proxy;
  /* jshint camelcase: true */

  if (proxyAddress)
    AWS.config.update({
      httpOptions: { agent: proxy(proxyAddress) }
    });
}

Adapter.prototype.initialize = function (callback) {
  var self = this;
  /* jshint camelcase: false */
  self.config = {
    accessKeyId: self.aws_access_key_id,
    secretAccessKey: self.aws_secret_access_key,
    region: self.region,
    sessionToken: self.sessionToken,
    apiVersions: self.apiVersions,
    httpOptions: {
      timeout: 5000
    }
  };

  self.ec2Config = {
    accessKeyId: self.aws_access_key_id,
    secretAccessKey: self.aws_secret_access_key,
    region: self.region,
    sessionToken: self.sessionToken,
    apiVersions: self.apiVersions,
    httpOptions: {
      timeout: 120000
    },
    maxRetries: 2
  };
  /* jshint camelcase: true */

  self.ec2 = new AWS.EC2(self.ec2Config);
  self.EC2 = bindSubAdapter(self, EC2);
  self.initialized = true;

  return callback();
};

function bindSubAdapter(newThis, subAdapter) {
  var boundAdapter = {};
  _.each(Object.keys(subAdapter),
    function (item) {
      boundAdapter[item] = subAdapter[item].bind(newThis);
    }
  );
  return boundAdapter;
}

// AWS EC2 API Docs
// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html

EC2.getImages =
  function (query, callback) {
    var params = {
      ImageIds: [
        query
      ]
    };

    this.ec2.describeImages(params,
      function (err, data) {
        if (err)
          return callback(err);

        var images = [];
        if (data.Images)
          images = data.Images;
        callback(null, images);
      }
    );
  };
