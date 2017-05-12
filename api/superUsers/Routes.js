'use strict';

module.exports = superUserRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function superUserRoutes(app) {
  app.post('/api/superusers', validateAccount, require('./postSuperUsers.js'));
  app.get('/api/superusers', validateAccount, require('./get.js'));
}
