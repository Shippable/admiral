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
      initialized: false,
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
            url: ''
          }
        },
        auth: {
          isEnabled: true,
          masterName: 'githubKeys',
          data: {
            clientId: '',
            clientSecret: '',
            wwwUrl: '',
            url: ''
          }
        },
        mktg: {
          isEnabled: true,
          masterName: 'url',
          data: {
            url: ''
          }
        },
        msg: {
          isEnabled: true,
          masterName: 'rabbitmqCreds',
          data: {
            amqpUrl: '',
            amqpUrlRoot: '',
            amqpUrlAdmin: '',
            amqpDefaultExchange: '',
            rootQueueList: ''
          }
        },
        redis: {
          isEnabled: true,
          masterName: 'url',
          data: {
            url: ''
          }
        },
        state: {
          isEnabled: true,
          masterName: 'gitlabCreds',
          data: {
            password: '',
            url: '',
            username: ''
          }
        },
        www: {
          isEnabled: true,
          masterName: 'url',
          data: {
            url: ''
          }
        }
      },
      systemSettings: {
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

    var systemIntDataDefaults = {
      api: {
        url: ADMIRAL_URL.substring(0, ADMIRAL_URL.lastIndexOf(':') + 1) +
            50000
      },
      auth: {
        clientId: '',
        clientSecret: '',
        wwwUrl: '',
        url: 'https://api.github.com'
      },
      mktg: {
        url: ADMIRAL_URL.substring(0, ADMIRAL_URL.lastIndexOf(':') + 1) +
          50002
      },
      msg: {
        amqpUrl: '',
        amqpUrlRoot: '',
        amqpUrlAdmin: '',
        amqpDefaultExchange: '',
        rootQueueList: ''
      },
      redis: {
        url: ''
      },
      state: {
        password: '',
        url: '',
        username: ''
      },
      www: {
        url: ADMIRAL_URL.substring(0, ADMIRAL_URL.lastIndexOf(':') + 1) +
          50001
      }
    };

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};

      async.series([
          setBreadcrumb.bind(null, bag),
          getSystemSettings.bind(null, bag),
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

    function getSystemSettings(bag, next) {
      admiralApiAdapter.getSystemSettings(
        function (err, systemSettings) {
          if (err)
            return next(err);
          if (_.isEmpty(systemSettings)) {
            // if empty, we can't do anything yet
            return next();
          }

          $scope.vm.systemSettings.db =
            _.extend($scope.vm.systemSettings.db,
              (systemSettings.db && JSON.parse(systemSettings.db)));
          $scope.vm.systemSettings.secrets =
            _.extend($scope.vm.systemSettings.secrets,
              (systemSettings.secrets && JSON.parse(systemSettings.secrets)));
          $scope.vm.systemSettings.msg =
            _.extend($scope.vm.systemSettings.msg,
              (systemSettings.msg && JSON.parse(systemSettings.msg)));
          $scope.vm.systemSettings.state =
            _.extend($scope.vm.systemSettings.state,
              (systemSettings.state && JSON.parse(systemSettings.state)));
          $scope.vm.systemSettings.redis =
            _.extend($scope.vm.systemSettings.redis,
              (systemSettings.redis && JSON.parse(systemSettings.redis)));

          $scope.vm.initializeForm.msgPassword =
              $scope.vm.systemSettings.msg.password || '';
          $scope.vm.initializeForm.statePassword =
            $scope.vm.systemSettings.state.rootPassword || '';

          $scope.vm.initialized = $scope.vm.systemSettings.db.isInitialized &&
            $scope.vm.systemSettings.secrets.isInitialized &&
            $scope.vm.systemSettings.msg.isInitialized &&
            $scope.vm.systemSettings.state.isInitialized &&
            $scope.vm.systemSettings.redis.isInitialized;

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
      if (!$scope.vm.initialized) return next();

      // reset all systemIntegrations to their defaults
      _.each($scope.vm.installForm,
        function (value, key) {
          resetSystemIntegration(key);
        }
      );

      admiralApiAdapter.getSystemIntegrations('',
        function (err, systemIntegrations) {
          if (err) {
            horn.error(err);
            return next();
          }

          // override defaults with actual systemInt values
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
          getSystemSettings.bind(null, bag),
          getAdmiralEnv.bind(null, bag)
        ],
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            horn.error(err);
            return;
          }
          pollSystemSettings();
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

    function pollSystemSettings() {
      var promise = $interval(function () {
        getSystemSettings({},
          function (err) {
            if (err) {
              horn.error(err);
              $scope.vm.initializing = false;
              $interval.cancel(promise);
            }

            var configs = $scope.vm.systemSettings;

            var processing = configs.db.isProcessing ||
              configs.secrets.isProcessing || configs.msg.isProcessing ||
              configs.state.isProcessing || configs.redis.isProcessing;

            var failed = configs.db.isFailed || configs.secrets.isFailed ||
              configs.msg.isFailed || configs.state.isFailed ||
              configs.redis.isFailed;

            if (!processing && (failed || $scope.vm.initialized)) {
              $scope.vm.initializing = false;
              $interval.cancel(promise);
              getSystemIntegrations({},
                function (err) {
                  if (err)
                    horn.error(err);
                }
              );
            }
          }
        );
      }, 3000);
    }

    function install() {
      $scope.vm.installing = true;

      async.series([
          updateAPISystemIntegration,
          updateWWWSystemIntegration,
          updateAuthSystemIntegration,
          updateMktgSystemIntegration,
          updateMsgSystemIntegration,
          updateRedisSystemIntegration,
          updateStateSystemIntegration
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

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateWWWSystemIntegration(next) {
      var bag = {
        name: 'www',
        masterName: $scope.vm.installForm.www.masterName,
        data: $scope.vm.installForm.www.data,
        isEnabled: $scope.vm.installForm.www.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateAuthSystemIntegration(next) {
      var bag = {
        name: 'auth',
        masterName: $scope.vm.installForm.auth.masterName,
        data: $scope.vm.installForm.auth.data,
        isEnabled: $scope.vm.installForm.auth.isEnabled
      };

      bag.data.wwwUrl = $scope.vm.installForm.www.data.url;

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateMktgSystemIntegration(next) {
      var bag = {
        name: 'mktg',
        masterName: $scope.vm.installForm.mktg.masterName,
        data: $scope.vm.installForm.mktg.data,
        isEnabled: $scope.vm.installForm.mktg.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateMsgSystemIntegration(next) {
      var bag = {
        name: 'msg',
        masterName: $scope.vm.installForm.msg.masterName,
        data: $scope.vm.installForm.msg.data,
        isEnabled: $scope.vm.installForm.msg.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateRedisSystemIntegration(next) {
      var bag = {
        name: 'redis',
        masterName: $scope.vm.installForm.redis.masterName,
        data: $scope.vm.installForm.redis.data,
        isEnabled: $scope.vm.installForm.redis.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateStateSystemIntegration(next) {
      var bag = {
        name: 'state',
        masterName: $scope.vm.installForm.state.masterName,
        data: $scope.vm.installForm.state.data,
        isEnabled: $scope.vm.installForm.state.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateSystemIntegration(bag, callback) {
      async.series([
          getSystemIntegration.bind(null, bag),
          postSystemIntegration.bind(null, bag),
          putSystemIntegration.bind(null, bag),
          deleteSystemIntegration.bind(null, bag)
        ],
        function (err) {
          return callback(err);
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
      if (!bag.isEnabled) return next();

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

    function putSystemIntegration(bag, next) {
      if (!bag.systemIntegration) return next();
      if (!bag.isEnabled) return next();

      admiralApiAdapter.putSystemIntegration(bag.systemIntegration.id, {
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

    function deleteSystemIntegration(bag, next) {
      if (!bag.systemIntegration) return next();
      if (bag.isEnabled) return next();

      admiralApiAdapter.deleteSystemIntegration(bag.systemIntegration.id,
        function (err) {
          if (err)
            return next(err);

          resetSystemIntegration(bag.name);

          return next();
        }
      );
    }

    function resetSystemIntegration(systemIntName) {
      $scope.vm.installForm[systemIntName].isEnabled = false;

      _.extend($scope.vm.installForm[systemIntName].data,
        systemIntDataDefaults[systemIntName]);
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
      $scope.vm.selectedService = $scope.vm.systemSettings[service];

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
      $scope.vm.selectedService = $scope.vm.systemSettings[service];
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
