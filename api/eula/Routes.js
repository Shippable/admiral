'use strict';

module.exports = eulaRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function eulaRoutes(app) {
  app.get('/api/eula', validateAccount, require('./get.js'));
}
