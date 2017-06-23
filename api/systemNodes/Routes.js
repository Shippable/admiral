'use strict';

module.exports = systemNodesRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemNodesRoutes(app) {
  app.delete('/api/systemNodes/:systemNodeId', validateAccount,
    require('./deleteById.js'));
  app.get('/api/systemNodes', validateAccount, require('./get.js'));
  app.post('/api/systemNodes', validateAccount, require('./post.js'));
  app.post('/api/systemNodes/initialize', validateAccount,
    require('./initialize.js'));
}
