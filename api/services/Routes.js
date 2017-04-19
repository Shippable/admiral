'use strict';

module.exports = servicesRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function servicesRoutes(app) {
  app.get('/api/services', validateAccount, require('./get.js'));
  app.post('/api/services', validateAccount, require('./post.js'));
}
