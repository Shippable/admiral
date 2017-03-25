(function () {
  'use strict';

  admiral.controller('loginCtrl', ['$scope', '$stateParams', '$q', '$state',
    'admiralApiAdapter', 'horn',
    loginCtrl
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('login', {
        url: '/login',
        templateUrl: SRC_PATH + 'login/login.html',
        controller: 'loginCtrl'
      });
    }
  ]);


  function loginCtrl($scope, $stateParams, $q, $state, admiralApiAdapter, horn) {
    var loginCtrlDefer = $q.defer();

    $scope._r.showCrumb = false;
    $scope.loginCtrlPromise = loginCtrlDefer.promise;

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
            loginCtrlDefer.reject(err);
            return horn.error(err);
          }

          loginCtrlDefer.resolve();
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
      $.cookie('loginToken', $scope.vm.loginToken);

      e.preventDefault();
      $state.go('dashboard', $state.params);
      window.scrollTo(0, 0);
    }
  }
}());
