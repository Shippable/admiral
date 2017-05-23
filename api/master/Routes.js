'use strict';

module.exports = masterRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function masterRoutes(app) {
  app.get('/api/master', validateAccount, require('./get.js'));
  app.get('/api/master/logs', validateAccount, require('./getLogs.js'));
  app.post('/api/master', validateAccount, require('./post.js'));
  app.post('/api/master/initialize', validateAccount,
    require('./initialize.js'));
  app.post('/api/master/cleanup', validateAccount,
    require('./cleanup.js'));
}
