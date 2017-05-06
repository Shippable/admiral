'use strict';

module.exports = stateRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function stateRoutes(app) {
  app.get('/api/redis', validateAccount, require('./get.js'));
  app.get('/api/redis/logs', validateAccount, require('./getLogs.js'));
  app.get('/api/redis/status', validateAccount, require('./getStatus.js'));
  app.post('/api/redis', validateAccount, require('./post.js'));
  app.post('/api/redis/initialize', validateAccount,
    require('./initialize.js'));
}
