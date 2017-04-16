'use strict';

module.exports = masterIntegrationFieldRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function masterIntegrationFieldRoutes(app) {
  app.get('/api/masterIntegrationFields', validateAccount, require('./get.js'));
}
