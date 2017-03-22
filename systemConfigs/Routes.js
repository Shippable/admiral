'use strict';
module.exports = systemCodeRoutes;
var validateAccount = require('../common/auth/validateAccount.js');

function systemCodeRoutes(app) {
  app.get('/systemConfigs', validateAccount, require('./getS.js'));
}
