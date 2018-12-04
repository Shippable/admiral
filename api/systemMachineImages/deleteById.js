'use strict';

var self = deleteById;
module.exports = self;

var async = require('async');

function deleteById(req, res) {
  var bag = {
    inputParams: req.params,
    resBody: {}
  };

  bag.who = util.format('systemMachineImages|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
    _checkInputParams.bind(null, bag),
    _deleteById.bind(null, bag)
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

  if (!bag.inputParams.systemMachineImageId)
    return next(
      new ActErr(who, ActErr.ParamNotFound,
        'Route parameter not found :systemMachineImageId')
    );

  bag.systemMachineImageId = bag.inputParams.systemMachineImageId;
  return next();
}

function _deleteById(bag, next) {
  var who = bag.who + '|' + _deleteById.name;
  logger.verbose(who, 'Inside');

  var query = util.format('DELETE FROM "systemMachineImages" ' +
    ' where id=\'%s\';',
    bag.systemMachineImageId);

  global.config.client.query(query,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to delete systemMachineImage with id: ' +
            bag.systemMachineImageId, err
          )
        );

      return next();
    }
  );
}
