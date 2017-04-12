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
      initializeForm: {
        msgPassword: '',
        statePassword: ''
      },
      systemConfigs: {
        db: {
          displayName: 'Database',
          getRoute: 'getDatabase',
          isInitialized: false
        },
        secrets: {
          displayName: 'Vault',
          getRoute: 'getSecrets'
        },
        msg: {
          displayName: 'Messaging',
          getRoute: 'getMsg'
        },
        state: {
          displayName: 'State',
          getRoute: 'getState'
        },
        redis: {
          displayName: 'Redis',
          getRoute: 'getRedis'
        }
      },
      selectedService: {},
      initializeResponse: '',
      initialize: initialize,
      showConfigModal: showConfigModal,
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
          if (err || !systemConfigs) {
            // the route will return an error when
            // the db hasn't been initialized yet
            return next();
          }

          $scope.vm.systemConfigs.db =
            _.extend($scope.vm.systemConfigs.db,
              (systemConfigs.db && JSON.parse(systemConfigs.db)));
          $scope.vm.systemConfigs.secrets =
            _.extend($scope.vm.systemConfigs.secrets,
              (systemConfigs.secrets && JSON.parse(systemConfigs.secrets)));
          $scope.vm.systemConfigs.msg =
            _.extend($scope.vm.systemConfigs.msg,
              (systemConfigs.msg && JSON.parse(systemConfigs.msg)));
          $scope.vm.systemConfigs.state =
            _.extend($scope.vm.systemConfigs.state,
              (systemConfigs.state && JSON.parse(systemConfigs.state)));
          $scope.vm.systemConfigs.redis =
            _.extend($scope.vm.systemConfigs.redis,
              (systemConfigs.redis && JSON.parse(systemConfigs.redis)));

          $scope.vm.initializeForm.msgPassword =
              $scope.vm.systemConfigs.msg.password || '';
          $scope.vm.initializeForm.statePassword =
            $scope.vm.systemConfigs.state.rootPassword || '';

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

    function showConfigModal(service) {
      $scope.vm.selectedService = $scope.vm.systemConfigs[service];

      admiralApiAdapter[$scope.vm.selectedService.getRoute](
        function (err, configs) {
          if (err)
            return horn.error(err);

          $scope.vm.selectedService.configs = [];

          _.each(configs,
            function(value, key) {
              $scope.vm.selectedService.configs.push({
                key: key,
                value: value
              });
            }
          );

          $('#configsModal').modal('show');
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
