'use strict';

module.exports = workerRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function workerRoutes(app) {
  app.get('/api/workers', validateAccount, require('./get.js'));
  app.post('/api/workers', validateAccount, require('./post.js'));
  app.post('/api/workers/initialize', validateAccount,
    require('./initialize.js'));
  app.delete('/api/workers/:name', validateAccount,
    require('./deleteByName.js'));
}
