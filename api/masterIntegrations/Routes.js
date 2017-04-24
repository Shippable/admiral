'use strict';

module.exports = masterIntegrationRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function masterIntegrationRoutes(app) {
  app.get('/api/masterIntegrations', validateAccount,
    require('./get.js'));
  app.put('/api/masterIntegrations/:masterIntegrationId', validateAccount,
    require('./put.js'));
}
