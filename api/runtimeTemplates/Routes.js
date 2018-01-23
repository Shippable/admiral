'use strict';
var validateAccount = require('../../common/auth/validateAccount.js');

function runtimeTemplateRoutes(app) {
  app.get('/api/runtimeTemplates', validateAccount, require('./get.js'));
}

module.exports = runtimeTemplateRoutes;
