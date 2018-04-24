'use strict';

module.exports = passthroughRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function passthroughRoutes(app) {
  app.get('/api/passthrough/ami/:id', validateAccount, require('./getImageByAmiId.js'));
  app.post('/api/passthrough/grisham', validateAccount,
   require('./postDefaultSystemCluster.js'))
}
