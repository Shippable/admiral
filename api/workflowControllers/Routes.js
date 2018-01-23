'use strict';
var validateAccount = require('../../common/auth/validateAccount.js');

module.exports = workflowControllerRoutes;

function workflowControllerRoutes(app) {
  app.get('/workflowControllers', validateAccount, require('./get.js'));
  app.post('/workflowControllers', validateAccount, require('./post.js'));
}
