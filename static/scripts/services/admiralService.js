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

  admiral.service('admiralService', ['API_URL', '$http',
    admiralService
  ]);

  function admiralService(API_URL, $http) {
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
      get: function (path, callback) {
        var promise = $http.get(API_URL + path);
        return handler(promise, callback);
      },
      put: function (path, body, callback) {
        var promise = $http.put(API_URL + path, body);
        return handler(promise, callback);
      },
      post: function (path, body, callback) {
        var promise = $http.post(API_URL + path, body);
        return handler(promise, callback);
      },
      delete: function (path, callback) {
        var promise = $http.delete(API_URL + path);
        return handler(promise, callback);
      }
    };
  }
}());
