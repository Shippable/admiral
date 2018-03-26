(function () {
  'use strict';

  admiral.controller('loginCtrl2', ['$scope', '$stateParams', '$q', '$state',
    'admiralApiAdapter', 'popup_horn',
    loginCtrl2
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('login2', {
        url: '/login',
        templateUrl: SRC_PATH + 'login/login2.html',
        controller: 'loginCtrl2',
        onEnter: function ($rootScope) {
          $rootScope.admiralPathName = 'login2';
        }
      });
    }
  ]);


  function loginCtrl2($scope, $stateParams, $q, $state,
    admiralApiAdapter, popup_horn) {
    var loginCtrl2Defer = $q.defer();

    $scope._r.showCrumb = false;
    $scope.loginCtrl2Promise = loginCtrl2Defer.promise;

    $scope.vm = {
      isLoaded: false,
      loginToken: null,
      logInToAdmiral: logInToAdmiral
    };

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};

      async.series([
          setBreadcrumb.bind(null, bag)
        ],
        function (err) {
          $scope.vm.isLoaded = true;
          if (err) {
            loginCtrl2Defer.reject(err);
            return popup_horn.error(err);
          }

          loginCtrl2Defer.resolve();
        }
      );
    }

    function setBreadcrumb(bag, next) {
      $scope._r.crumbList = [];

      var crumb = {
        name: 'Log In'
      };
      $scope._r.crumbList.push(crumb);
      $scope._r.showCrumb = true;
      $scope._r.title = 'Log in to Admiral - Shippable';
      return next();
    }

    function logInToAdmiral(e) {
      var loginToken = $scope.vm.loginToken;

      admiralApiAdapter.postAuth({
          loginToken: loginToken
        },
        function (err) {
          if (err)
            return popup_horn.error(err);

          e.preventDefault();
          $scope._r.loginToken = loginToken;
          $state.go('dashboardNew', $state.params);
          window.scrollTo(0, 0);
        }
      );
    }
  }
}());
