'use strict';

module.exports = secretsRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function secretsRoutes(app) {
  app.get('/api/secrets', validateAccount, require('./get.js'));
  app.get('/api/secrets/logs', validateAccount, require('./getLogs.js'));
  app.post('/api/secrets', validateAccount, require('./post.js'));
}
