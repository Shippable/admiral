'use strict';

module.exports = admiralRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function admiralRoutes(app) {
  app.get('/api/admiral', validateAccount, require('./get.js'));
  app.put('/api/admiral', validateAccount, require('./put.js'));
  app.post('/api/admiral', validateAccount, require('./post.js'));
}
