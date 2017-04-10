'use strict';

module.exports = dbRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function dbRoutes(app) {
  app.get('/api/db', validateAccount, require('./get.js'));
  app.post('/api/db/initialize', validateAccount,
    require('./postInitialize.js'));
}
