'use strict';

module.exports = servicesRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function servicesRoutes(app) {
  app.post('/api/services', validateAccount, require('./post.js'));
}
