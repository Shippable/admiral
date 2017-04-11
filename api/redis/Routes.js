'use strict';

module.exports = stateRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function stateRoutes(app) {
  app.get('/api/redis', validateAccount, require('./get.js'));
  app.post('/api/redis', validateAccount, require('./post.js'));
}
