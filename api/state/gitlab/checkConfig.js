'use strict';

var self = checkConfig;
module.exports = self;

var async = require('async');
var _ = require('underscore');


function checkConfig(config, callback) {
  var bag = {
    config: config
  };

  bag.who = util.format('state|gitlab|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkConfig.bind(null, bag)
    ],
    function (err) {
      logger.info(bag.who, 'Completed');
      if (err)
        return callback(err);

      return callback();
    }
  );
}

function _checkConfig(bag, next) {
  var who = bag.who + '|' + _checkConfig.name;
  logger.verbose(who, 'Inside');

  var missingConfigFields = [];

  if (!_.has(bag.config, 'address') || _.isEmpty(bag.config.address))
    missingConfigFields.push('address');
  if (!_.has(bag.config, 'port') || !_.isNumber(bag.config.port))
    missingConfigFields.push('port');
  if (!_.has(bag.config, 'sshPort') || !_.isNumber(bag.config.sshPort))
    missingConfigFields.push('sshPort');
  if (!_.has(bag.config, 'securePort') || !_.isNumber(bag.config.securePort))
    missingConfigFields.push('securePort');

  if (missingConfigFields.length)
    return next(
      new ActErr(who, ActErr.DataNotFound,
        'Missing config data: ' + missingConfigFields.join())
    );

  return next();
}
