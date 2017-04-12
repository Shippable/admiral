'use strict';

module.exports = systemIntegrationRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemIntegrationRoutes(app) {
  app.post('/api/systemIntegrations', validateAccount, require('./post.js'));
}
