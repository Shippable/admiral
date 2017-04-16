'use strict';

module.exports = providersRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function providersRoutes(app) {
  app.get('/api/providers', validateAccount, require('./get.js'));
  app.post('/api/providers', validateAccount, require('./post.js'));
}
