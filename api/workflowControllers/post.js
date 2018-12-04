'use strict';

var self = post;
module.exports = self;

var async = require('async');
var _ = require('underscore');

function post(req, res) {
  var bag = {
    reqBody: req.body,
    resBody: {}
  };

  bag.who = util.format('workflowControllers|%s', self.name);
  logger.info(bag.who, 'Starting');

  async.series([
      _checkInputParams.bind(null, bag),
      _post.bind(null, bag),
      _getWorkflowController.bind(null, bag)
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

  if (!bag.reqBody.objectType)
    return next(
      new ActErr(who, ActErr.DataNotFound, 'Missing body data :objectType')
    );

  return next();
}

function _post(bag, next) {
  var who = bag.who + '|' + _post.name;
  logger.verbose(who, 'Inside');

  // Defaulting objectId to 1 such that objectId and objectType remains unique
  bag.objectId = '1';

  var insertStatement = util.format('INSERT INTO "workflowControllers" ' +
    '("objectType", "objectId", "createdAt", "updatedAt") ' +
    'values (\'%s\', \'%s\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    bag.reqBody.objectType, bag.objectId);

  global.config.client.query(insertStatement,
    function (err) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to create workflowController with error: ' +
            util.inspect(err))
        );

      return next();
    }
  );
}

function _getWorkflowController(bag, next) {
  var who = bag.who + '|' + _getWorkflowController.name;
  logger.verbose(who, 'Inside');

  var query = util.format(
    'SELECT * FROM "workflowControllers" WHERE "objectId"=\'%s\'',
    bag.objectId);

  global.config.client.query(query,
    function (err, workflowControllers) {
      if (err)
        return next(
          new ActErr(who, ActErr.DBOperationFailed,
            'Failed to get workflowController with error: ' + util.inspect(err))
        );

      if (_.isEmpty(workflowControllers.rows))
        return next(
          new ActErr(who, ActErr.DBEntityNotFound,
            'workflowController not found for objectId: ' + bag.objectId)
        );

      logger.debug('Found workflowController ' + bag.objectId);

      bag.resBody = workflowControllers.rows[0];
      return next();
    }
  );
}
