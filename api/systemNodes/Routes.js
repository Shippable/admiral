'use strict';

module.exports = systemNodesRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function systemNodesRoutes(app) {
  app.post('/api/systemNodes', validateAccount, require('./post.js'));
}
