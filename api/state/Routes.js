'use strict';

module.exports = stateRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function stateRoutes(app) {
  app.get('/api/state', validateAccount, require('./get.js'));
  app.get('/api/state/logs', validateAccount, require('./getLogs.js'));
  app.get('/api/state/status', validateAccount, require('./getStatus.js'));
  app.post('/api/state', validateAccount, require('./post.js'));
  app.put('/api/state', validateAccount, require('./put.js'));
  app.post('/api/state/initialize', validateAccount,
    require('./initialize.js'));
  app.post('/api/state/migrate', validateAccount, require('./migrate.js'));
}
