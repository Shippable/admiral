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
      // Admiral Routes
      getAdmiralEnv: function (callback) {
        return API.get('/api/admiral', callback);
      },
      //  Auth Routes
      postAuth: function (body, callback) {
        return API.post('/api/auth', body, callback);
      },
      postLogout: function (body, callback) {
        return API.post('/api/logout', body, callback);
      },
      // Master Integrations Routes
      getMasterIntegrations: function (callback) {
        return API.get('/api/masterIntegrations', callback);
      },
      putMasterIntegration: function (masterIntegrationId, body, callback) {
        return API.put('/api/masterIntegrations/' +
          masterIntegrationId, body, callback);
      },
      // System Machine Image Routes
      getSystemMachineImages: function (query, callback) {
        return API.get('/api/systemMachineImages?' + query, callback);
      },
      putSystemMachineImage: function (systemMachineImageId, body, callback) {
        return API.put('/api/systemMachineImages/' + systemMachineImageId,
          body, callback);
      },
      // System Settings Routes
      getSystemSettings: function (callback) {
        return API.get('/api/systemSettings', callback);
      },
      putSystemSettings: function (systemSettingId, body, callback) {
        return API.put('/api/systemSettings/' + systemSettingId,
          body, callback);
      },
      // System Integration Routes
      getSystemIntegrations: function (query, callback) {
        return API.get('/api/systemIntegrations?' + query, callback);
      },
      postSystemIntegration: function (body, callback) {
        return API.post('/api/systemIntegrations', body, callback);
      },
      putSystemIntegration: function (systemIntegrationId, body, callback) {
        return API.put('/api/systemIntegrations/' +
          systemIntegrationId, body, callback);
      },
      deleteSystemIntegration: function (systemIntegrationId, callback) {
        return API.delete('/api/systemIntegrations/' +
          systemIntegrationId, callback);
      },
      // Service Routes
      postInitialize: function (body, callback) {
        return API.post('/api/workflow/initialize', body, callback);
      },
      postSecrets: function (body, callback) {
        return API.post('/api/secrets', body, callback);
      },
      getService: function (component, callback) {
        return API.get('/api/' + component, callback);
      },
      postService: function (body, callback) {
        return API.post('/api/services', body, callback);
      },
      // Services Routes
      getServices: function (query, callback) {
        return API.get('/api/services?' + query, callback);
      },
      // logs
      getServiceLogs: function (component, callback) {
        return API.get('/api/' + component + '/logs', callback);
      }
    };
  }
}());
