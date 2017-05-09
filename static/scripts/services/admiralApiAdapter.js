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
      // DB Routes
      postDB: function (body, callback) {
        return API.post('/api/db', body, callback);
      },
      postDBCleanup: function (body, callback) {
        return API.post('/api/db/cleanup', body, callback);
      },
      // Machine Keys Routes
      getMachineKeys: function (callback) {
        return API.get('/api/machineKeys', callback);
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
          systemIntegrationId, {}, callback);
      },
      // Core Services Routes (secrets, msg, state, redis, master)
      getCoreService: function (coreService, callback) {
        return API.get('/api/' + coreService, callback);
      },
      postSecrets: function (body, callback) {
        return API.post('/api/secrets', body, callback);
      },
      initSecrets: function (body, callback) {
        return API.post('/api/secrets/initialize', body, callback);
      },
      postMsg: function (body, callback) {
        return API.post('/api/msg', body, callback);
      },
      initMsg: function (body, callback) {
        return API.post('/api/msg/initialize', body, callback);
      },
      postState: function (body, callback) {
        return API.post('/api/state', body, callback);
      },
      initState: function (body, callback) {
        return API.post('/api/state/initialize', body, callback);
      },
      postRedis: function (body, callback) {
        return API.post('/api/redis', body, callback);
      },
      initRedis: function (body, callback) {
        return API.post('/api/redis/initialize', body, callback);
      },
      postMaster: function (body, callback) {
        return API.post('/api/master', body, callback);
      },
      initMaster: function (body, callback) {
        return API.post('/api/master/initialize', body, callback);
      },
      getServiceLogs: function (component, callback) {
        return API.get('/api/' + component + '/logs', callback);
      },
      // Component Services Routes
      getServices: function (query, callback) {
        return API.get('/api/services?' + query, callback);
      },
      postService: function (body, callback) {
        return API.post('/api/services', body, callback);
      },
      deleteService: function (serviceName, body, callback) {
        return API.delete('/api/services/' + serviceName, body, callback);
      }
    };
  }
}());
