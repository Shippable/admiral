'use strict';
var validateAccount = require('../../common/auth/validateAccount.js');

module.exports = systemClusterRoutes;

function systemClusterRoutes(app) {
  app.get('/systemClusters', validateAccount, require('./get.js'));
  app.post('/systemClusters', validateAccount, require('./post.js'));
}
