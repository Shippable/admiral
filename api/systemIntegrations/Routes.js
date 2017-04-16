'use strict';

module.exports = systemIntegrationRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemIntegrationRoutes(app) {
  app.post('/api/systemIntegrations', validateAccount, require('./post.js'));
  app.get('/api/systemIntegrations', validateAccount, require('./get.js'));
}
