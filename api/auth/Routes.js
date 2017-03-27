'use strict';

module.exports = authRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function authRoutes(app) {
  app.post('/api/auth', require('./post.js'));
  app.post('/api/logout', require('./postLogout.js'));
}
