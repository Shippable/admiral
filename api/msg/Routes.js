'use strict';

module.exports = msgRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function msgRoutes(app) {
  app.get('/api/msg', validateAccount, require('./get.js'));
  app.get('/api/msg/logs', validateAccount, require('./getLogs.js'));
  app.get('/api/msg/status', validateAccount, require('./getStatus.js'));
  app.post('/api/msg', validateAccount, require('./post.js'));
  app.put('/api/msg', validateAccount, require('./put.js'));
  app.post('/api/msg/initialize', validateAccount, require('./initialize.js'));
}
