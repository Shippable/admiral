'use strict';

module.exports = workflowRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function workflowRoutes(app) {
  app.post('/api/workflow/initialize', validateAccount,
    require('./initialize.js'));
}
