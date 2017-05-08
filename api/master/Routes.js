'use strict';

module.exports = masterRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function masterRoutes(app) {
  app.get('/api/master', validateAccount, require('./get.js'));
}
