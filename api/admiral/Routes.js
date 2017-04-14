'use strict';

module.exports = authRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function authRoutes(app) {
  app.get('/api/admiral', validateAccount, require('./get.js'));
}
