'use strict';

module.exports = stateRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function stateRoutes(app) {
  app.get('/api/state', validateAccount, require('./get.js'));
}
