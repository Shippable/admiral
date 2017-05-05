'use strict';

module.exports = machineKeys;
var validateAccount = require('../../common/auth/validateAccount.js');

function machineKeys(app) {
  app.get('/api/machineKeys', validateAccount, require('./get.js'));
}
