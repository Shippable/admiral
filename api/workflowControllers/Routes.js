'use strict';
var validateAccount = require('../../common/auth/validateAccount.js');

module.exports = workflowControllerRoutes;

function workflowControllerRoutes(app) {
  app.get('/api/workflowControllers', validateAccount, require('./get.js'));
  app.post('/api/workflowControllers', validateAccount, require('./post.js'));
}
