'use strict';

module.exports = authRoutes;

function authRoutes(app) {
  app.post('/api/auth', require('./post.js'));
  app.post('/api/logout', require('./postLogout.js'));
}
