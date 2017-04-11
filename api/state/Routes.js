'use strict';

module.exports = secretsRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function secretsRoutes(app) {
  app.get('/api/state', validateAccount, require('./get.js'));
}
