(function () {
  'use strict';

  admiral.controller('dashboardCtrl', ['$scope', '$stateParams', '$q', '$state',
    '$interval', 'ADMIRAL_URL', 'admiralApiAdapter', 'horn',
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


  function dashboardCtrl($scope, $stateParams, $q, $state, $interval,
    ADMIRAL_URL, admiralApiAdapter, horn) {
    var dashboardCtrlDefer = $q.defer();

    $scope._r.showCrumb = false;
    $scope.dashboardCtrlPromise = dashboardCtrlDefer.promise;

    $scope.vm = {
      isLoaded: false,
      initializing: false,
      installing: false,
      initializeForm: {
        msgPassword: '',
        statePassword: '',
        accessKey: '',
        secretKey: ''
      },
      installForm: {
        api: {
          isEnabled: true,
          masterName: 'url',
          data: {
            url: ADMIRAL_URL.substring(0, ADMIRAL_URL.lastIndexOf(':') + 1) +
              50000
          }
        },
        statePassword: '',
        accessKey: '',
        secretKey: ''
      },
      systemConfigs: {
        db: {
          displayName: 'Database',
          isInitialized: false
        },
        secrets: {
          displayName: 'Secrets'
        },
        msg: {
          displayName: 'Messaging'
        },
        state: {
          displayName: 'State'
        },
        redis: {
          displayName: 'Redis'
        }
      },
      selectedService: {},
      initialize: initialize,
      install: install,
      showAdmiralEnvModal: showAdmiralEnvModal,
      showConfigModal: showConfigModal,
      showLogModal: showLogModal,
      refreshLogs: refreshLogs,
      logOutOfAdmiral: logOutOfAdmiral
    };

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};

      async.series([
          setBreadcrumb.bind(null, bag),
          getSystemConfigs.bind(null, bag),
          getAdmiralEnv.bind(null, bag),
          getSystemIntegrations.bind(null, bag)
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
          if (err)
            return next(err);
          if (_.isEmpty(systemConfigs)) {
            // if empty, we can't do anything yet
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

    function getAdmiralEnv(bag, next) {
      admiralApiAdapter.getAdmiralEnv(
        function (err, admiralEnv) {
          if (err) {
            horn.error(err);
            return next();
          }

          $scope.vm.admiralEnv = admiralEnv;
          return next();
        }
      );
    }

    function getSystemIntegrations(bag, next) {
      admiralApiAdapter.getSystemIntegrations('',
        function (err, systemIntegrations) {
          if (err) {
            horn.error(err);
            return next();
          }

          _.each(systemIntegrations,
            function (systemIntegration) {
              if ($scope.vm.installForm[systemIntegration.name]) {
                _.extend($scope.vm.installForm[systemIntegration.name].data,
                  systemIntegration.data);
                $scope.vm.installForm[systemIntegration.name].isEnabled = true;
              }
            });

          return next();
        }
      );
    }

    function initialize() {
      $scope.vm.initializing = true;
      var bag = {};
      async.series([
          postInitialize.bind(null, bag),
          getSystemConfigs.bind(null, bag),
          getAdmiralEnv.bind(null, bag)
        ],
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            horn.error(err);
            return;
          }
          pollSystemConfigs();
        }
      );
    }
    function postInitialize(bag, next) {
      admiralApiAdapter.postInitialize($scope.vm.initializeForm,
        function (err) {
          return next(err);
        }
      );
    }


    function pollSystemConfigs() {
      var promise = $interval(function () {
        getSystemConfigs({},
          function (err) {
            if (err) {
              horn.error(err);
              $scope.vm.initializing = false;
              $interval.cancel(promise);
            }

            var configs = $scope.vm.systemConfigs;

            var processing = configs.db.isProcessing ||
              configs.secrets.isProcessing || configs.msg.isProcessing ||
              configs.state.isProcessing || configs.redis.isProcessing;

            var failed = configs.db.isFailed || configs.secrets.isFailed ||
              configs.msg.isFailed || configs.state.isFailed ||
              configs.redis.isFailed;

            var initialized = configs.db.isInitialized &&
              configs.secrets.isInitialized && configs.msg.isInitialized &&
              configs.state.isInitialized && configs.redis.isInitialized;

            if (!processing && (failed || initialized)) {
              $scope.vm.initializing = false;
              $interval.cancel(promise);
            }
          }
        );
      }, 3000);
    }

    function install() {
      $scope.vm.installing = true;

      async.series([
          updateAPISystemIntegration
        ],
        function (err) {
          $scope.vm.installing = false;
          if (err) {
            horn.error(err);
            return;
          }
        }
      );
    }

    function updateAPISystemIntegration(next) {
      var bag = {
        name: 'api',
        masterName: $scope.vm.installForm.api.masterName,
        data: $scope.vm.installForm.api.data,
        isEnabled: $scope.vm.installForm.api.isEnabled
      };

      async.series([
          getSystemIntegration.bind(null, bag),
          postSystemIntegration.bind(null, bag)
        ],
        function (err) {
          return next(err);
        }
      );
    }

    function getSystemIntegration(bag, next) {
      var query = 'name=' + bag.name + '&masterName=' + bag.masterName;
      admiralApiAdapter.getSystemIntegrations(query,
        function (err, systemIntegrations) {
          if (err)
            return next(err);

          if (systemIntegrations.length)
            bag.systemIntegration = systemIntegrations[0];

          return next();
        }
      );
    }

    function postSystemIntegration(bag, next) {
      if (bag.systemIntegration) return next();
      admiralApiAdapter.postSystemIntegration({
          name: bag.name,
          masterName: bag.masterName,
          data: bag.data
        },
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function showAdmiralEnvModal() {
      $scope.vm.selectedService = {};

      admiralApiAdapter.getAdmiralEnv(
        function (err, admiralEnv) {
          if (err)
            return horn.error(err);

          $scope.vm.selectedService.configs = [];

          _.each(admiralEnv,
            function (value, key) {
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


    function showConfigModal(service) {
      $scope.vm.selectedService = $scope.vm.systemConfigs[service];

      admiralApiAdapter.getService(service,
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

    function showLogModal(service) {
      $scope.vm.selectedService = $scope.vm.systemConfigs[service];
      $scope.vm.selectedService.serviceName = service;
      $scope.vm.selectedService.logs = [];

      admiralApiAdapter.getServiceLogs(service,
        function (err, logs) {
          if (err)
            return horn.error(err);

          $scope.vm.selectedService.logs = logs;

          $('#logsModal').modal('show');
        }
      );
    }

    function refreshLogs() {
      admiralApiAdapter.getServiceLogs($scope.vm.selectedService.serviceName,
        function (err, logs) {
          if (err)
            return horn.error(err);

          $scope.vm.selectedService.logs = logs;
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
