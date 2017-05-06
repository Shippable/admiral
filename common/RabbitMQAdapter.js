'use strict';

var request = require('request');
var _ = require('underscore');

module.exports = RabbitMQAdapter;

function RabbitMQAdapter(baseUrl) {
  this.baseUrl = baseUrl;
}

// HTTP request methods.

RabbitMQAdapter.prototype.request = function (path, method, body, callback) {
  var url = this.baseUrl + '/api/' + path;
  logger.debug('RabbitMQ management API request: ', method, url);
  //adding the accept : '*' header because, 'request' internally adds
  //accept: 'application/json' header, which is not accepted by the
  //rabbitmq-management while getting messages. If, accept: 'application/json'
  //is present, rabbitmq-management returns 406.
  request({
      url: url,
      json: body,
      method: method,
      rejectUnauthorized: false,
      requestCert: true,
      agent: false,
      headers: {
        accept: '*'
      }
    },
    function (err, res, data) {
      if (!err && res.statusCode > 299)
        err = res.statusCode;
      if (data && _.isString(data)) {
        try {
          data = JSON.parse(data);
        } catch (error) {
          err = error;
        }
      }
      logger.debug('RabbitMQ management API response: ', err || res.statusCode);
      callback(err, data, res);
    }
  );
};

RabbitMQAdapter.prototype.get = function (path, callback) {
  this.request(path, 'GET', null, callback);
};

// User API calls

RabbitMQAdapter.prototype.getUser = function (name, callback) {
  this.get('users/' + name, callback);
};

RabbitMQAdapter.prototype.getUserPermissions = function (name, callback) {
  this.get('users/' + name + '/permissions', callback);
};
