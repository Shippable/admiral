'use strict';

module.exports = systemConfigRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemConfigRoutes(app) {
  app.get('/api/systemConfigs', validateAccount, require('./get.js'));
  app.put('/api/systemConfigs/:systemConfigId', validateAccount,
    require('./put.js'));
}
