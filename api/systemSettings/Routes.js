'use strict';

module.exports = systemSettingsRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemSettingsRoutes(app) {
  app.get('/api/systemSettings', validateAccount, require('./get.js'));
  app.put('/api/systemSettings/:systemSettingId', validateAccount,
    require('./put.js'));
}
