(function () {
  'use strict';

  admiral.controller('dashboardCtrl', ['$scope', '$stateParams', '$q', '$state',
    'admiralApiAdapter', 'horn',
    dashboardCtrl
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('dashboard', {
        url: '/',
        templateUrl: SRC_PATH + 'dashboard/dashboard.html',
        controller: 'dashboardCtrl'
      });
    }
  ]);


  function dashboardCtrl($scope, $stateParams, $q, $state, admiralApiAdapter,
    horn) {
    var dashboardCtrlDefer = $q.defer();

    $scope._r.showCrumb = false;
    $scope.dashboardCtrlPromise = dashboardCtrlDefer.promise;

    $scope.vm = {
      isLoaded: false,
      initializing: false,
      dbInitialized: false,
      secretsInitialized: false,
      stateInitialized: false,
      msgInitialized: false,
      rdsInitialized: false,
      initializeForm: {
        msgPassword: '',
        statePassword: ''
      },
      initializeResponse: '',
      initialize: initialize,
      logOutOfAdmiral: logOutOfAdmiral
    };

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};

      async.series([
          setBreadcrumb.bind(null, bag),
          getSystemConfigs.bind(null, bag)
        ],
        function (err) {
          $scope.vm.isLoaded = true;
          if (err) {
            dashboardCtrlDefer.reject(err);
            return horn.error(err);
          }
          $scope.vm.systemConfigs = bag.systemConfigs;
          dashboardCtrlDefer.resolve();
        }
      );
    }

    function setBreadcrumb(bag, next) {
      $scope._r.crumbList = [];

      var crumb = {
        name: 'Dashboard'
      };
      $scope._r.crumbList.push(crumb);
      $scope._r.showCrumb = true;
      $scope._r.title = 'Admiral - Shippable';
      return next();
    }

    function getSystemConfigs(bag, next) {
      admiralApiAdapter.getSystemConfigs(
        function (err, systemConfigs) {
          if (err) {
            // the route will return an error when
            // the db hasn't been initialized yet
            $scope.vm.dbInitialized = false;
            return next();
          }

          bag.systemConfigs = systemConfigs;

          bag.dbStatus = JSON.parse(systemConfigs.db);
          bag.secretsStatus = systemConfigs.secrets &&
            JSON.parse(systemConfigs.secrets);
          bag.msgStatus = systemConfigs.msg && JSON.parse(systemConfigs.msg);
          bag.stateStatus = systemConfigs.state &&
            JSON.parse(systemConfigs.state);
          bag.rdsStatus = systemConfigs.redis &&
            JSON.parse(systemConfigs.redis);

          $scope.vm.dbInitialized = bag.dbStatus && bag.dbStatus.isInitialized;

          $scope.vm.secretsInitialized =
            bag.secretsStatus && bag.secretsStatus.isInitialized;

          $scope.vm.msgInitialized =
            bag.msgStatus && bag.msgStatus.isInitialized;
          $scope.vm.initializeForm.msgPassword =
              (bag.msgStatus && bag.msgStatus.password) || '';

          $scope.vm.stateInitialized =
            bag.stateStatus && bag.stateStatus.isInitialized;
          $scope.vm.initializeForm.statePassword =
            (bag.stateStatus && bag.stateStatus.rootPassword) || '';

          $scope.vm.rdsInitialized =
            bag.rdsStatus && bag.rdsStatus.isInitialized;

          return next();
        }
      );
    }

    function initialize() {
      $scope.vm.initializing = true;
      var bag = {};
      async.series([
          postInitialize.bind(null, bag),
          getSystemConfigs.bind(null, bag)
        ],
        function (err) {
          $scope.vm.initializing = false;
          if (err) {
            console.log(err);
            return;
          }
          $scope.vm.systemConfigs = bag.systemConfigs;
        }
      );
    }
    function postInitialize(bag, next) {
      admiralApiAdapter.postInitialize($scope.vm.initializeForm,
        function (err) {
          if (err)
            $scope.vm.initializeResponse = err.methodName + ': ' + err.message;
          return next();
        }
      );
    }

    function logOutOfAdmiral(e) {
      admiralApiAdapter.postLogout({},
        function (err) {
          if (err)
            return horn.error(err);

          e.preventDefault();
          $state.go('login', $state.params);
          window.scrollTo(0, 0);
        }
      );
    }
  }
}());
