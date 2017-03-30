'use strict';

module.exports = systemConfigRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemConfigRoutes(app) {
  app.get('/api/systemConfigs', validateAccount, require('./get.js'));
}
