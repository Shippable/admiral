(function () {
  'use strict';

  /** admiralService
   *
   *  GET, PUT, POST, DELETE to Admiral API
   *
   *  Methods return the $http promise so you
   *  can implement your own handlers or you
   *  can supply a callback (err, data) that
   *  is called when the request completes.
   */

  admiral.service('admiralService', ['ADMIRAL_URL', '$http', '$rootScope',
    admiralService
  ]);

  function admiralService(ADMIRAL_URL, $http, $rootScope) {
    function handler(promise, callback) {
      if (callback)
        promise
          .success(function (data) {
            callback(null, data);
          })
          .error(function (data) {
            callback(data, null);
          });

      return promise;
    }
    return {
      // We're getting the login token here because it's not set until login.
      get: function (path, callback) {

        var promise = $http.get(ADMIRAL_URL + path, {
          headers: {
            Authorization: 'apiToken ' + $rootScope._r.loginToken
          }
        });
        return handler(promise, callback);
      },
      put: function (path, body, callback) {
        var promise = $http.put(ADMIRAL_URL + path, body, {
          headers: {
            Authorization: 'apiToken ' + $rootScope._r.loginToken
          }
        });
        return handler(promise, callback);
      },
      post: function (path, body, callback) {
        var promise = $http.post(ADMIRAL_URL + path, body, {
          headers: {
            Authorization: 'apiToken ' + $rootScope._r.loginToken
          }
        });
        return handler(promise, callback);
      },
      delete: function (path, callback) {
        var promise = $http.delete(ADMIRAL_URL + path, {
          headers: {
            Authorization: 'apiToken ' + $rootScope._r.loginToken
          }
        });
        return handler(promise, callback);
      }
    };
  }
}());
