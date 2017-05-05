'use strict';

var self = get;
module.exports = self;

var async = require('async');
var path = require('path');
var fs = require('fs-extra');

function get(req, res) {
  var bag = {
    publicKeyPath: path.join(global.config.configDir, 'machinekey.pub'),
    privateKeyPath: path.join(global.config.configDir, 'machinekey'),
    resBody: {
      publicKey: null,
      privateKey: null
    }
  };

  bag.who = util.format('machineKeys|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _checkPublicKeyExists.bind(null, bag),
    _checkPrivateKeyExists.bind(null, bag),
    _readPublicSSHKey.bind(null, bag),
    _readPrivateSSHKey.bind(null, bag)
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

  return next();
}

function _checkPublicKeyExists(bag, next) {
  var who = bag.who + '|' + _checkPublicKeyExists.name;
  logger.verbose(who, 'Inside');

  fs.stat(bag.publicKeyPath,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get ' + bag.publicKeyPath +
            ' with error: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _checkPrivateKeyExists(bag, next) {
  var who = bag.who + '|' + _checkPrivateKeyExists.name;
  logger.verbose(who, 'Inside');

  fs.stat(bag.privateKeyPath,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to get ' + bag.privateKeyPath +
            ' with error: ' + util.inspect(err))
        );

      return next();
    }
  );
}

function _readPublicSSHKey(bag, next) {
  var who = bag.who + '|' + _readPublicSSHKey.name;
  logger.verbose(who, 'Inside');

  fs.readFile(bag.publicKeyPath,
    function (err, data) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to read public SSH key with error: ' + util.inspect(err))
        );

      bag.resBody.publicKey = data.toString();
      return next();
    }
  );
}

function _readPrivateSSHKey(bag, next) {
  var who = bag.who + '|' + _readPrivateSSHKey.name;
  logger.verbose(who, 'Inside');

  fs.readFile(bag.privateKeyPath,
    function (err, data) {
      if (err)
        return next(
          new ActErr(who, ActErr.OperationFailed,
            'Failed to read private SSH key with error: ' + util.inspect(err))
        );

      bag.resBody.privateKey = data.toString();
      return next();
    }
  );
}
