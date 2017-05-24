'use strict';

module.exports = servicesRoutes;
var validateAccount = require('../../common/auth/validateAccount.js');

function servicesRoutes(app) {
  app.get('/api/services', validateAccount, require('./get.js'));
  app.post('/api/services', validateAccount, require('./post.js'));
  app.delete('/api/services/:serviceName', validateAccount,
    require('./deleteByName.js'));
  app.put('/api/services/:serviceName', validateAccount,
    require('./put.js'));
}
