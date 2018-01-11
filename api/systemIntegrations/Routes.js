'use strict';

module.exports = systemIntegrationRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemIntegrationRoutes(app) {
  app.post('/api/systemIntegrations', validateAccount, require('./post.js'));
  app.post('/api/systemIntegrations/:systemIntegrationId/validate', validateAccount,
    require('./validateSysIntBaseUrl.js'));
  app.get('/api/systemIntegrations', validateAccount, require('./get.js'));
  app.put('/api/systemIntegrations/:systemIntegrationId', validateAccount,
    require('./put.js'));
  app.delete('/api/systemIntegrations/:systemIntegrationId', validateAccount, require('./deleteById.js'));
}
