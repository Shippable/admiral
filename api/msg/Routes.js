'use strict';

module.exports = msgRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function msgRoutes(app) {
  app.get('/api/msg', validateAccount, require('./get.js'));
  app.post('/api/msg', validateAccount, require('./post.js'));
}
