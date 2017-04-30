'use strict';

module.exports = authRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function authRoutes(app) {
  app.get('/api/version', validateAccount, require('./get.js'));
}
