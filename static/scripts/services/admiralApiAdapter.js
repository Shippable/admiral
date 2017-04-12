(function () {
  'use strict';

  /** admiralApiAdapter
   *  Used for calling API routes
   */

  admiral.factory('admiralApiAdapter', ['admiralService',
    admiralApiAdapter
  ]);

  function admiralApiAdapter(admiralService) {
    var API = admiralService;
    return {
      //  Auth Routes
      postAuth: function (body, callback) {
        return API.post('/api/auth', body, callback);
      },
      postLogout: function (body, callback) {
        return API.post('/api/logout', body, callback);
      },
      // System Config Routes
      getSystemConfigs: function (callback) {
        return API.get('/api/systemConfigs', callback);
      },
      // Service Routes
      postInitialize: function (body, callback) {
        return API.post('/api/workflow/initialize', body, callback);
      },
      getDatabase: function (callback) {
        return API.get('/api/db', callback);
      },
      getSecrets: function (callback) {
        return API.get('/api/secrets', callback);
      },
      postSecrets: function (body, callback) {
        return API.post('/api/secrets', body, callback);
      },
      getMsg: function (callback) {
        return API.get('/api/msg', callback);
      },
      getState: function (callback) {
        return API.get('/api/state', callback);
      },
      getRedis: function (callback) {
        return API.get('/api/redis', callback);
      }
    };
  }
}());
