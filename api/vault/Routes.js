'use strict';

module.exports = vaultRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function vaultRoutes(app) {
  app.get('/api/vault', validateAccount, require('./getS.js'));
}
