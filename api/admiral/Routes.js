'use strict';

module.exports = admiralRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function admiralRoutes(app) {
  app.get('/api/admiral', validateAccount, require('./get.js'));
}
