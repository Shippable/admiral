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

  var timeout = 120000;

  function admiralService(ADMIRAL_URL, $http, $rootScope) {
    function handler(promise, callback) {
      var startTime = Date.now();
      if (callback)
        promise
          .success(function (data) {
            callback(null, data);
          })
          .error(function (data) {
            if (!data) {
              var endTime = Date.now();
              if ((endTime - startTime) >= timeout)
                return callback('Request timed out', null);
              else
                return callback('Request failed', null);
            }

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
          },
          timeout: timeout
        });
        return handler(promise, callback);
      },
      put: function (path, body, callback) {
        var promise = $http.put(ADMIRAL_URL + path, body, {
          headers: {
            Authorization: 'apiToken ' + $rootScope._r.loginToken
          },
          timeout: timeout
        });
        return handler(promise, callback);
      },
      post: function (path, body, callback) {
        var promise = $http.post(ADMIRAL_URL + path, body, {
          headers: {
            Authorization: 'apiToken ' + $rootScope._r.loginToken
          },
          timeout: timeout
        });
        return handler(promise, callback);
      },
      delete: function (path, body, callback) {
        var promise = $http.delete(ADMIRAL_URL + path, {
          headers: {
            Authorization: 'apiToken ' + $rootScope._r.loginToken,
            'Content-Type': 'application/json;charset=utf-8'
          },
          data: body,
          timeout: timeout
        });
        return handler(promise, callback);
      }

    };
  }
}());
