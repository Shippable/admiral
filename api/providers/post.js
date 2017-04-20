'use strict';

var self = post;
module.exports = self;

var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');
var urlParser = require('url');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('providers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _normalizeUrl.bind(null, bag),
    _getExistingProvider.bind(null, bag),
    _post.bind(null, bag),
    _getProvider.bind(null, bag)
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

  if (!bag.reqBody)
    return next(
      new ActErr(who, ActErr.BodyNotFound, 'Missing body')
    );

  if (!bag.reqBody.url || !_.isString(bag.reqBody.url))
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing body data or wrong type :url')
    );

  if (!bag.reqBody.name)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :name')
    );

  // This is a special case for azure as its dns does
  // not contain '//'. So urlParser is unable to find
  // the hostname.
  if (bag.reqBody.url.indexOf('//') === -1)
    bag.urlHostname =
      urlParser.parse('//'.concat(bag.reqBody.url), true, true).hostname;
  else
    bag.urlHostname = urlParser.parse(bag.reqBody.url, true, true).hostname;

  if (!bag.urlHostname)
    return next(
      new ActErr(who, ActErr.InvalidParam, 'Invalid url')
    );

  return next();
}

function _normalizeUrl(bag, next){
  var who = bag.who + '|' + _normalizeUrl.name;
  logger.verbose(who, 'Inside');

  var url = bag.reqBody.url.toLowerCase();
  bag.reqBody.url = url.replace(/\/+$/, '');

  return next();
}

function _getExistingProvider(bag, next) {
  var who = bag.who + '|' + _getExistingProvider.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "providers" WHERE ' +
    '"url"=\'%s\'', bag.reqBody.url);

  global.config.client.query(query,
    function (err, providers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (!_.isEmpty(providers.rows) &&
        !_.isEmpty(providers.rows[0])) {
        bag.resBody = providers.rows[0];
        bag.providerExists = true;
        return next();
      }

      return next();
    }
  );
}

function _post(bag, next) {
  if (bag.providerExists) return next();

  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  var retryOpts = {times: 4};

  bag.providerId = mongoose.Types.ObjectId().toString();

  var urlSlug = bag.urlHostname;

  async.retry(retryOpts,
    function (callback) {

      var insertStatement = util.format('INSERT INTO "providers" ' +
        '("id", "url", "name", "urlSlug", ' +
        '"createdAt", "updatedAt") ' +
        'values (\'%s\', \'%s\', \'%s\', \'%s\',' +
        ' \'2016-06-01\', \'2016-06-01\')',
        bag.providerId, bag.reqBody.url, bag.reqBody.name, urlSlug);

      global.config.client.query(insertStatement,
        function (err) {
          if (err) {
            // 23505 is duplicate key error
            if (err.code === '23505') {
              urlSlug = bag.urlHostname + '-';
              var possible = 'abcdefghijklmnopqrstuvwxyz';
              for (var i = 0; i < 2; i++) {
                urlSlug +=
                  possible.charAt(Math.floor(Math.random() * possible.length));
              }
              return callback(err);
            }
            else {
              return callback(
                new ActErr(who, ActErr.DBOperationFailed, err)
              );
            }
          }
          return callback();
        }
      );
    },
    function (err) {
      return next(err);
    }
  );
}

function _getProvider(bag, next) {
  if (bag.providerExists) return next();

  var who = bag.who + '|' + _getProvider.name;
  logger.verbose(who, 'Inside');

  var query = util.format('SELECT * FROM "providers" WHERE ' +
    '"id"=\'%s\'', bag.providerId);

  global.config.client.query(query,
    function (err, providers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed, err)
        );

      if (!_.isEmpty(providers.rows) &&
        !_.isEmpty(providers.rows[0])) {
        bag.resBody = providers.rows[0];
        return next();
      }

      return next(
        new ActErr(who, ActErr.DataNotFound,
          'No provider found')
      );
    }
  );
}
