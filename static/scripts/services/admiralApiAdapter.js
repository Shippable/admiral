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
      //  systemCodes Routes
      getSystemCodes: function (query, callback) {
        return API.get('/systemCodes?' + query, callback);
      }
    };
  }
}());
