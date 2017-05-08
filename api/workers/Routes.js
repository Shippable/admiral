'use strict';

module.exports = workerRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function workerRoutes(app) {
  app.get('/api/workers', validateAccount, require('./get.js'));
}
