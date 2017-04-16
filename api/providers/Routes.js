'use strict';

module.exports = providersRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function providersRoutes(app) {
  app.post('/api/providers', validateAccount, require('./post.js'));
}
