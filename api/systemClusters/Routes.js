'use strict';
var validateAccount = require('../../common/auth/validateAccount.js');

module.exports = systemClusterRoutes;

function systemClusterRoutes(app) {
  app.get('/api/systemClusters', validateAccount, require('./get.js'));
  app.post('/api/systemClusters', validateAccount, require('./post.js'));
  app.delete('/api/systemClusters/:systemClusterId', validateAccount,
    require('./deleteById.js'));
}
