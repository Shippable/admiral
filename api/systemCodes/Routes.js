'use strict';

module.exports = systemCodesRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemCodesRoutes(app) {
  app.get('/api/systemCodes', validateAccount, require('./get.js'));
}
