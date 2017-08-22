(function () {
  'use strict';

  /* global _, async */

  admiral.controller('dashboardCtrl', ['$scope', '$stateParams', '$q', '$state',
    '$interval', 'admiralApiAdapter', 'horn',
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
    admiralApiAdapter, horn) {
    /* jshint maxstatements:150 */
    var dashboardCtrlDefer = $q.defer();

    $scope._r.showCrumb = false;
    $scope.dashboardCtrlPromise = dashboardCtrlDefer.promise;
    var providerAuthNames = {
      bitbucketKeys: 'bitbucket',
      bitbucketServerKeys: 'bitbucketServer',
      githubKeys: 'github',
      githubEnterpriseKeys: 'ghe',
      gitlabKeys: 'gitlab'
    };

    $scope.vm = {
      isLoaded: false,
      initializing: false,
      initialized: false,
      dbInitialized: false,
      upgrading: false,
      installing: false,
      saving: false,
      restartingServices: false,
      requireRestart: false,
      globalServices: [
        'api',
        'mktg',
        'www',
        'internalAPI',
        'consoleAPI'
      ],
      initializeForm: {
        secrets: {
          // install type can be admiral (same node as admiral), new, or existing
          initType: 'admiral',
          address: '',
          rootToken: '',
          confirmCommand: false
        },
        msg: {
          initType: 'admiral',
          password: '',
          address: '',
          isSecure: false,
          username: '',
          confirmCommand: false
        },
        state: {
          initType: 'admiral',
          rootPassword: '',
          address: '',
          sshPort: 0,
          confirmCommand: false
        },
        redis: {
          initType: 'admiral',
          address: '',
          confirmCommand: false
        },
        master: {
          initType: 'admiral'
        },
        workers: {
          initType: 'admiral',
          newWorker: {
            name: '',
            address: ''
          },
          workers: [],
          deletedWorkers: [],
          enableLogsButton: false,
          confirmCommand: false
        },
        sshCommand: '',
        installerAccessKey: '',
        installerSecretKey: ''
      },
      // map by systemInt name, then masterName
      installForm: {
        api: {
          url: {
            isEnabled: true,
            masterName: 'url',
            data: {
              url: ''
            }
          }
        },
        internalAPI: {
          url: {
            isEnabled: false,
            masterName: 'url',
            data: {
              url: ''
            }
          }
        },
        consoleAPI: {
          url: {
            isEnabled: false,
            masterName: 'url',
            data: {
              url: ''
            }
          }
        },
        auth: {
          bitbucketKeys: {
            isEnabled: false,
            masterName: 'bitbucketKeys',
            data: {
              clientId: '',
              clientSecret: '',
              wwwUrl: '',
              url: ''
            }
          },
          bitbucketServerKeys: {
            isEnabled: false,
            masterName: 'bitbucketServerKeys',
            data: {
              clientId: '',
              clientSecret: '',
              wwwUrl: '',
              url: ''
            }
          },
          githubKeys: {
            isEnabled: false,
            masterName: 'githubKeys',
            data: {
              clientId: '',
              clientSecret: '',
              wwwUrl: '',
              url: ''
            }
          },
          githubEnterpriseKeys: {
            isEnabled: false,
            masterName: 'githubEnterpriseKeys',
            data: {
              clientId: '',
              clientSecret: '',
              wwwUrl: '',
              url: ''
            }
          },
          gitlabKeys: {
            isEnabled: false,
            masterName: 'gitlabKeys',
            data: {
              clientId: '',
              clientSecret: '',
              wwwUrl: '',
              url: ''
            }
          }
        },
        scm: {
          bitbucket: {
            isEnabled: false
          },
          bitbucketServer: {
            isEnabled: false
          },
          github: {
            isEnabled: false
          },
          githubEnterprise: {
            isEnabled: false
          },
          gitlab: {
            isEnabled: false
          }
        },
        filestore: {
          amazonKeys: {
            isEnabled: false,
            masterName: 'amazonKeys',
            data: {
              accessKey: '',
              secretKey: ''
            }
          }
        },
        mktg: {
          url: {
            isEnabled: true,
            masterName: 'url',
            data: {
              url: ''
            }
          }
        },
        msg: {
          rabbitmqCreds: {
            isEnabled: true,
            masterName: 'rabbitmqCreds',
            data: {
              amqpUrl: '',
              amqpUrlRoot: '',
              amqpUrlAdmin: '',
              amqpDefaultExchange: '',
              rootQueueList: ''
            }
          }
        },
        notification:  {
          gmailCreds: {
            isEnabled: false,
            masterName: 'gmailCreds',
            data: {
              username: '',
              password: '',
              proxy: '',
              emailSender: ''
            }
          },
          mailgunCreds: {
            isEnabled: false,
            masterName: 'mailgunCreds',
            data: {
              apiKey: '',
              domain: '',
              proxy: '',
              emailSender: ''
            }
          },
          smtpCreds: {
            isEnabled: false,
            masterName: 'smtpCreds',
            data: {
              emailAuthUser: '',
              emailAuthPassword: '',
              emailSender: '',
              host: '',
              port: '',
              secure: '',
              hostname: '',
              proxy: ''
            }
          }
        },
        provision: {
          amazonKeys: {
            isEnabled: false,
            masterName: 'amazonKeys',
            data: {
              accessKey: '',
              secretKey: ''
            }
          }
        },
        redis:  {
          url: {
            isEnabled: true,
            masterName: 'url',
            data: {
              url: ''
            }
          }
        },
        state: {
          gitlabCreds: {
            isEnabled: true,
            masterName: 'gitlabCreds',
            data: {
              password: '',
              url: '',
              username: ''
            }
          }
        },
        sshKeys: {
          'ssh-key': {
            isEnabled: true,
            masterName: 'ssh-key',
            data: {
              publicKey: '',
              privateKey: ''
            }
          }
        },
        www: {
          url: {
            isEnabled: true,
            masterName: 'url',
            data: {
              url: ''
            }
          }
        },
        systemMachineImages: [],
        systemSettings: {},
      },
      allServices: [],
      systemIntegrations: [],
      masterIntegrations: [],
      addonsForm: {
        artifactory: {
          displayName: '',
          isEnabled: false
        },
        AWS: {
          displayName: '',
          isEnabled: false
        },
        AWS_IAM: {
          displayName: '',
          isEnabled: false
        },
        AZURE_DCOS: {
          displayName: '',
          isEnabled: false
        },
        CLUSTER: {
          displayName: '',
          isEnabled: false
        },
        DCL: {
          displayName: '',
          isEnabled: false
        },
        DDC: {
          displayName: '',
          isEnabled: false
        },
        Docker: {
          displayName: '',
          isEnabled: false
        },
        'Docker Trusted Registry': {
          displayName: '',
          isEnabled: false
        },
        ECR: {
          displayName: '',
          isEnabled: false
        },
        GCR: {
          displayName: '',
          isEnabled: false
        },
        GKE: {
          displayName: '',
          isEnabled: false
        },
        hipchat: {
          displayName: '',
          isEnabled: false
        },
        hubspotToken: {
          displayName: '',
          isEnabled: false
        },
        irc: {
          displayName: '',
          isEnabled: false
        },
        Jenkins: {
          displayName: '',
          isEnabled: false
        },
        KUBERNETES: {
          displayName: '',
          isEnabled: false
        },
        'pem-key': {
          displayName: '',
          isEnabled: false
        },
        'Private Docker Registry': {
          displayName: '',
          isEnabled: false
        },
        'Quay.io': {
          displayName: '',
          isEnabled: false
        },
        Slack: {
          displayName: '',
          isEnabled: false
        },
        TRIPUB: {
          displayName: '',
          isEnabled: false
        },
        webhook: {
          displayName: '',
          isEnabled: false
        },
        DOC: {
          displayName: '',
          isEnabled: false
        },
        keyValuePair: {
          displayName: '',
          isEnabled: false
        },
        MAZ: {
          displayName: '',
          isEnabled: false
        },
        GCL: {
          displayName: '',
          isEnabled: false
        },
        gitCredential: {
          displayName: '',
          isEnabled: false
        },
        systemSettings: {},
        systemIntegrations: {
          clearbit: {
            isEnabled: false,
            name: 'clearbit',
            masterName: 'keyValuePair',
            data: {
              envs: {
                clearbitApiKey: ''
              }
            }
          },
          deploy: {
            isEnabled: false,
            name: 'deploy',
            masterName: 'amazonKeys',
            data: {
              accessKey: '',
              secretKey: ''
            }
          },
          mktg: {
            isEnabled: false,
            name: 'mktg',
            masterName: 'hubspotToken',
            data: {
              hubspotApiEndPoint: '',
              hubspotApiToken: ''
            }
          },
          mktgDB: {
            isEnabled: false,
            name: 'mktgDB',
            masterName: 'keyValuePair',
            data: {
              envs: {
                dbName: '',
                dbUsername: '',
                dbPassword: '',
                dbHost: '',
                dbPort: '',
                dbDialect: ''
              }
            }
          },
          payment: {
            isEnabled: false,
            name: 'payment',
            masterName: 'braintreeKeys',
            data: {
              braintreeMerchantId: '',
              braintreePrivateKey: '',
              braintreeEnvironment: '',
              braintreePublicKey: ''
            }
          },
          segment: {
            isEnabled: false,
            name: 'segment',
            masterName: 'keyValuePair',
            data: {
              envs: {
                segmentApiKey: '',
                segmentMktgKey: ''
              }
            }
          }
        }
      },
      superUsers: {
        addingSuperUser: false,
        deletingSuperUser: false,
        newSuperUser: '',
        superUsers: []
      },
      installingAddons: false,
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
        },
        master: {
          displayName: 'Swarm Master'
        },
        workers: []
      },
      systemSettingsId: null,
      selectedService: {},
      initialize: initialize,
      validatePassword: validatePassword,
      validateIP: validateIP,
      validateWorkerAddress: validateWorkerAddress,
      addWorker: addWorker,
      removeWorker: removeWorker,
      addSystemMachineImage: addSystemMachineImage,
      removeSystemMachineImage: removeSystemMachineImage,
      upgrade: upgrade,
      install: install,
      save: save,
      saveServices: saveServices,
      restartServices: restartServices,
      installAddons: installAddons,
      toggleAuthProvider: toggleAuthProvider,
      addSuperUser: addSuperUser,
      removeSuperUser: removeSuperUser,
      showAdmiralEnvModal: showAdmiralEnvModal,
      showConfigModal: showConfigModal,
      showLogModal: showLogModal,
      showWorkersLogModal: showWorkersLogModal,
      showSaveModal: showSaveModal,
      showSaveServicesModal: showSaveServicesModal,
      showRestartServicesModal: showRestartServicesModal,
      showEULAModal: showEULAModal,
      refreshLogs: refreshLogs,
      isGlobalService: isGlobalService,
      hasDefaultSystemMachineImage: hasDefaultSystemMachineImage,
      logOutOfAdmiral: logOutOfAdmiral,
      systemNodes: {
        addingSystemNode: false,
        systemNodes: []
      },
      addSystemNode: addSystemNode,
      removeSystemNode: removeSystemNode,
      eulaText: '',
      runMode: 'production'
    };

    var systemIntDataDefaults = {};

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};

      async.series([
          setBreadcrumb.bind(null, bag),
          getAdmiralEnv.bind(null, bag),
          getSystemSettings.bind(null, bag),
          setupSystemIntDefaults.bind(null, bag),
          getSystemIntegrations.bind(null, bag),
          updateInitializeForm.bind(null, bag),
          getMachineKeys.bind(null, bag),
          getMasterIntegrations.bind(null, bag),
          getSystemSettingsForInstallPanel.bind(null, bag),
          getServices.bind(null, bag),
          getSystemMachineImages,
          getSystemSettingsForAddonsPanel.bind(null, bag),
          updateAddonsFormSystemIntegrations,
          getSuperUsers,
          getSystemNodes
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
          $scope.vm.systemSettings.master =
            _.extend($scope.vm.systemSettings.master,
              (systemSettings.master && JSON.parse(systemSettings.master)));
          var workers = systemSettings.workers &&
            JSON.parse(systemSettings.workers);
          if (_.isArray(workers)) {
            $scope.vm.systemSettings.workers = workers;
            _.each(workers,
              function (systemSettingsWorker) {
                var index =
                  _.findIndex($scope.vm.initializeForm.workers.workers,
                    function (initFormWorker) {
                      return initFormWorker.name === systemSettingsWorker.name;
                    }
                  );
                _.extend($scope.vm.initializeForm.workers.workers[index],
                  systemSettingsWorker);
              }
            );
          }
          $scope.vm.systemSettings.releaseVersion =
            systemSettings.releaseVersion;

          $scope.vm.dbInitialized = $scope.vm.systemSettings.db.isInitialized;

          $scope.vm.initialized = $scope.vm.systemSettings.db.isInitialized &&
            $scope.vm.systemSettings.secrets.isInitialized &&
            $scope.vm.systemSettings.msg.isInitialized &&
            $scope.vm.systemSettings.state.isInitialized &&
            $scope.vm.systemSettings.redis.isInitialized &&
            $scope.vm.systemSettings.master.isInitialized &&
            $scope.vm.systemSettings.workers.length &&
            _.every($scope.vm.systemSettings.workers,
              function (worker) {
                return worker.isInitialized;
              }
            );

          return next();
        }
      );
    }

    function setupSystemIntDefaults(bag, next) {

      var defaultWorkerAddress = $scope.vm.admiralEnv.ADMIRAL_IP;
      if (!_.isEmpty($scope.vm.systemSettings.workers))
        defaultWorkerAddress =
          _.first($scope.vm.systemSettings.workers).address;

      systemIntDataDefaults = {
        api: {
          url: {
            url: 'http://' + defaultWorkerAddress + ':50000'
          }
        },
        internalAPI: {
          url: {
            url: 'http://' + defaultWorkerAddress + ':50000'
          }
        },
        consoleAPI: {
          url: {
            url: 'http://' + defaultWorkerAddress + ':50000'
          }
        },
        auth: {
          bitbucketKeys: {
            clientId: '',
            clientSecret: '',
            wwwUrl: '',
            url: 'https://api.bitbucket.org'
          },
          bitbucketServerKeys: {
            clientId: '',
            clientSecret: '',
            wwwUrl: '',
            url: ''
          },
          githubKeys: {
            clientId: '',
            clientSecret: '',
            wwwUrl: '',
            url: 'https://api.github.com'
          },
          githubEnterpriseKeys: {
            clientId: '',
            clientSecret: '',
            wwwUrl: '',
            url: ''
          },
          gitlabKeys: {
            clientId: '',
            clientSecret: '',
            wwwUrl: '',
            url: 'https://gitlab.com/api/v3'
          }
        },
        filestore:{
          amazonKeys: {
            accessKey: '',
            secretKey: ''
          }
        },
        mktg: {
          url: {
            url: 'http://' + defaultWorkerAddress + ':50002'
          },
          hubspotToken: {
            hubspotApiEndPoint: '',
            hubspotApiToken: ''
          }
        },
        msg: {
          rabbitmqCreds: {
            amqpUrl: '',
            amqpUrlRoot: '',
            amqpUrlAdmin: '',
            amqpDefaultExchange: '',
            rootQueueList: ''
          }
        },
        notification:  {
          gmailCreds: {
            username: '',
            password: '',
            proxy: '',
            emailSender: ''
          },
          mailgunCreds: {
            apiKey: '',
            domain: '',
            proxy: '',
            emailSender: ''
          },
          smtpCreds: {
            emailAuthUser: '',
            emailAuthPassword: '',
            emailSender: '',
            host: '',
            port: '',
            secure: '',
            hostname: '',
            proxy: ''
          }
        },
        provision:{
          amazonKeys: {
            accessKey: '',
            secretKey: ''
          }
        },
        redis: {
          url: {
            url: ''
          }
        },
        sshKeys: {
          'ssh-key': {
            publicKey: '',
            privateKey: ''
          }
        },
        state: {
          gitlabCreds: {
            password: '',
            url: '',
            username: ''
          }
        },
        www: {
          url: {
            url: 'http://' + defaultWorkerAddress + ':50001'
          }
        },
        // Addons integrations
        clearbit: {
          keyValuePair: {
            envs: {
              clearbitApiKey: ''
            }
          }
        },
        deploy: {
          amazonKeys: {
            accessKey: '',
            secretKey: ''
          }
        },
        mktgDB: {
          keyValuePair: {
            envs: {
              dbName: '',
              dbUsername: '',
              dbPassword: '',
              dbHost: '',
              dbPort: '',
              dbDialect: ''
            }
          }
        },
        payment: {
          braintreeKeys: {
            braintreeMerchantId: '',
            braintreePrivateKey: '',
            braintreeEnvironment: '',
            braintreePublicKey: ''
          }
        },
        segment: {
          keyValuePair: {
            envs: {
              segmentApiKey: '',
              segmentMktgKey: ''
            }
          }
        }
      };

      return next();
    }

    function getSystemIntegrations(bag, next) {
      if (!$scope.vm.dbInitialized) return next();
      if (!$scope.vm.systemSettings.secrets.isInitialized) return next();

      var installFormNonSystemInts = ['systemMachineImages',
        'scm', 'systemSettings'];

      // reset all systemIntegrations to their defaults
      _.each($scope.vm.installForm,
        function (systemInts, systemIntName) {
          if (!_.contains(installFormNonSystemInts, systemIntName)) {
            _.each(systemInts,
              function (value, masterName) {
                resetSystemIntegration(systemIntName, masterName);
              }
            );
          }
        }
      );

      admiralApiAdapter.getSystemIntegrations('',
        function (err, systemIntegrations) {
          if (err) {
            horn.error(err);
            return next();
          }

          var apiIntegration =
            _.findWhere(systemIntegrations, {name: 'api'});

          var internalAPIIntegration =
            _.findWhere(systemIntegrations, {name: 'internalAPI'});

          // If internalAPIIntegration is not present copy
          //over the values of the default api to it
          if (!internalAPIIntegration && apiIntegration)
            $scope.vm.installForm.internalAPI.url.data.url =
              apiIntegration.data.url;

          var consoleAPIIntegration =
            _.findWhere(systemIntegrations, {name: 'consoleAPI'});

          // If consoleAPIIntegration is not present copy
          //over the values of the default api to it
          if (!consoleAPIIntegration && apiIntegration)
            $scope.vm.installForm.consoleAPI.url.data.url =
              apiIntegration.data.url;

          $scope.vm.systemIntegrations = systemIntegrations;

          // override defaults with actual systemInt values
          _.each(systemIntegrations,
            function (systemIntegration) {
              var sysIntName = systemIntegration.name;
              var masterName = systemIntegration.masterName;

              if ($scope.vm.installForm[sysIntName] &&
                $scope.vm.installForm[sysIntName][masterName]) {
                _.extend(
                  $scope.vm.installForm[sysIntName][masterName].data,
                  systemIntegration.data
                );
                $scope.vm.installForm[sysIntName][masterName].isEnabled = true;

                if (sysIntName === 'auth') {
                  var providerAuthName = providerAuthNames[masterName];
                  if (!_.isEmpty(providerAuthName)) {
                    $scope.vm.installForm[sysIntName][masterName].callbackUrl =
                      systemIntegration.data.wwwUrl + '/auth/' +
                      providerAuthName + '/' + systemIntegration.id +
                      '/identify';
                  }
                }
              }
            }
          );

          return next();
        }
      );
    }

    function updateInitializeForm(bag, next) {
      if ($scope.vm.admiralEnv) {
        $scope.vm.initializeForm.installerAccessKey =
          $scope.vm.admiralEnv.ACCESS_KEY;
        $scope.vm.initializeForm.installerSecretKey =
          $scope.vm.admiralEnv.SECRET_KEY;
      }

      _.each($scope.vm.initializeForm,
        function (obj, service) {
          /* jshint maxcomplexity:20 */
          if (!_.isObject(obj)) return;

          if (service === 'workers')
            $scope.vm.initializeForm.workers.workers =
              $scope.vm.systemSettings.workers;
          else
            _.each(obj,
              function (value, key) {
                if ($scope.vm.systemSettings[service][key])
                  $scope.vm.initializeForm[service][key] =
                    $scope.vm.systemSettings[service][key];
              }
            );

          if (service === 'secrets') {
            $scope.vm.initializeForm[service].rootToken =
              $scope.vm.admiralEnv.VAULT_TOKEN || '';
          } else if (service === 'msg') {
            var msgSystemIntegration = _.findWhere($scope.vm.systemIntegrations,
              {name: 'msg', masterName: 'rabbitmqCreds'});
            if (msgSystemIntegration) {
              var auth = msgSystemIntegration.data.amqpUrlRoot.
                split('@')[0].split('//')[1];
              $scope.vm.initializeForm[service].username = auth.split(':')[0];
              $scope.vm.initializeForm[service].password = auth.split(':')[1];
            }
          } else if (service === 'state') {
            var stateSystemIntegration =
              _.findWhere($scope.vm.systemIntegrations,
                {name: 'state', masterName: 'gitlabCreds'});
            if (stateSystemIntegration)
              $scope.vm.initializeForm[service].rootPassword =
                stateSystemIntegration.data.password;
          }

          if (!_.has($scope.vm.systemSettings[service], 'isShippableManaged') ||
            $scope.vm.systemSettings[service].isShippableManaged) {
            if (service === 'workers') {
              var nonAdmiralWorkerIP = _.some($scope.vm.systemSettings.workers,
                function (worker) {
                  return worker.address !== $scope.vm.admiralEnv.ADMIRAL_IP;
                }
              );
              if (nonAdmiralWorkerIP) {
                $scope.vm.initializeForm.workers.initType = 'new';
                var allWorkersInitialized = _.every(
                  $scope.vm.systemSettings.workers,
                  function (worker) {
                    return worker.isInitialized;
                  }
                );
                if (allWorkersInitialized)
                  $scope.vm.initializeForm.workers.confirmCommand = true;
                var workerInitAttempted = _.some(
                  $scope.vm.systemSettings.workers,
                  function (worker) {
                    return worker.isProcessing || worker.isFailed ||
                      worker.isInitialized;
                  }
                );
                if (workerInitAttempted)
                  $scope.vm.initializeForm.workers.enableLogsButton = true;
              }
            } else if (!obj.address ||
            obj.address === $scope.vm.admiralEnv.ADMIRAL_IP) {
              $scope.vm.initializeForm[service].initType = 'admiral';
            } else {
              $scope.vm.initializeForm[service].initType = 'new';
            }
          } else {
            $scope.vm.initializeForm[service].initType = 'existing';
          }
          if ($scope.vm.systemSettings[service].isInitialized)
            $scope.vm.initializeForm[service].confirmCommand = true;
        }
      );

      return next();
    }

    function updateInstallForm(workers, next) {
      if (_.isEmpty(workers)) return next();

      var defaultAddress = _.first(workers).address;
      systemIntDataDefaults.api.url.url  =
        'http://' + defaultAddress + ':50000';
      systemIntDataDefaults.www.url.url  =
        'http://' + defaultAddress + ':50001';
      systemIntDataDefaults.mktg.url.url  =
        'http://' + defaultAddress + ':50002';

      return next();
    }

    function updateAddonsFormSystemIntegrations(next) {

      // reset all systemIntegrations to their defaults
      _.each($scope.vm.addonsForm.systemIntegrations,
        function (systemIntegration, sysIntName) {
          if (!sysIntName || !systemIntegration.masterName) return;
          _.extend($scope.vm.addonsForm.systemIntegrations[sysIntName].data,
            systemIntDataDefaults[sysIntName][systemIntegration.masterName]);
        }
      );

      // override defaults with actual systemInt values
      _.each($scope.vm.systemIntegrations,
          function (systemIntegration) {
            var sysIntName = systemIntegration.name;
            if ($scope.vm.addonsForm.systemIntegrations[sysIntName] &&
              $scope.vm.addonsForm.systemIntegrations[sysIntName].masterName ===
              systemIntegration.masterName) {
              _.extend(
                $scope.vm.addonsForm.systemIntegrations[sysIntName].data,
                systemIntegration.data
              );
              $scope.vm.addonsForm.systemIntegrations[sysIntName].isEnabled =
                true;
            }
          }
        );

      return next();
    }

    function getMachineKeys(bag, next) {
      admiralApiAdapter.getMachineKeys(
        function (err, machineKeys) {
          if (err) {
            horn.error(err);
            return next();
          }

          $scope.vm.machineKeys = machineKeys;
          $scope.vm.initializeForm.sshCommand =
            'sudo mkdir -p /root/.ssh; echo ' + machineKeys.publicKey +
            '| sudo tee -a /root/.ssh/authorized_keys;';
          return next();
        }
      );
    }

    function getMasterIntegrations(bag, next) {
      if (!$scope.vm.dbInitialized) return next();

      admiralApiAdapter.getMasterIntegrations(
        function (err, masterIntegrations) {
          if (err) {
            horn.error(err);
            return next();
          }

          $scope.vm.masterIntegrations = masterIntegrations;

          _.each(masterIntegrations,
            function (masterInt) {
              if (_.has($scope.vm.installForm.scm, masterInt.name))
                $scope.vm.installForm.scm[masterInt.name].isEnabled =
                  masterInt.isEnabled;

              if (_.has($scope.vm.addonsForm, masterInt.name)) {
                $scope.vm.addonsForm[masterInt.name].isEnabled =
                  masterInt.isEnabled;
                $scope.vm.addonsForm[masterInt.name].displayName =
                  masterInt.displayName;
              }
            }
          );

          return next();
        }
      );
    }

    function getSystemSettingsForInstallPanel(bag, next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemSettings(
        function (err, systemSettings) {
          if (err) {
            horn.error(err);
            return next();
          }

          if (!systemSettings)
            return next();

          $scope.vm.systemSettingsId = systemSettings.id;

          // services are mapped to $scope.vm.systemSettings
          // don't also map services to the install form
          var installPanelSystemSettings = [
            'defaultMinionCount',
            'autoSelectBuilderToken',
            'buildTimeoutMS',
            'defaultPrivateJobQuota',
            'serviceUserToken',
            'runMode',
            'allowSystemNodes',
            'allowDynamicNodes',
            'allowCustomNodes',
            'jobConsoleBatchSize',
            'jobConsoleBufferTimeIntervalMS',
            'apiRetryIntervalMS',
            'accountSyncFrequencyHr',
            'rootS3Bucket',
            'nodeScriptsLocation',
            'enforcePrivateJobQuota',
            'technicalSupportAvailable',
            'customNodesAdminOnly',
            'allowedSystemImageFamily',
            'defaultMinionInstanceSize'
          ];

          _.each(installPanelSystemSettings,
            function (key) {
              $scope.vm.installForm.systemSettings[key] =
                systemSettings[key];
            }
          );

          $scope.vm.runMode = systemSettings.runMode;

          return next();
        }
      );
    }

    function getServices(bag, next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getServices('',
        function (err, services) {
          if (err) {
            horn.error(err);
            return next();
          }

          $scope.vm.allServices = services;

          if (!$scope.vm.installing && !$scope.vm.saving)
            // Don't change this while installing
            $scope.vm.requireRestart = _.some($scope.vm.allServices,
              function (service) {
                return service.isEnabled;
              }
            );

          return next();
        }
      );
    }

    function getSystemMachineImages(next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemMachineImages('',
        function (err, systemMachineImages) {
          if (err) {
            horn.error(err);
            return next();
          }

          if (_.isEmpty(systemMachineImages)) {
            horn.error('No default system machine image found. ' +
              'Please reinitialize.');
            return next();
          }

          $scope.vm.installForm.systemMachineImages =
            _.map(systemMachineImages,
              function (image) {
                if (image.subnetId === null)
                  image.subnetId = '';
                return image;
              }
            );

          return next();
        }
      );
    }

    function getSystemSettingsForAddonsPanel(bag, next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemSettings(
        function (err, systemSettings) {
          if (err) {
            horn.error(err);
            return next();
          }

          if (!systemSettings)
            return next();

          $scope.vm.systemSettingsId = systemSettings.id;

          // services are mapped to $scope.vm.systemSettings
          // don't also map services to the install form
          var addonsPanelSystemSettings = [
            'hubspotListId',
            'hubspotShouldSimulate',
            'awsAccountId'
          ];

          _.each(addonsPanelSystemSettings,
            function (key) {
              $scope.vm.addonsForm.systemSettings[key] =
                systemSettings[key];
            }
          );

          return next();
        }
      );
    }

    function validatePassword(password) {
      if (password.length < 8)
        return 'has-error';
    }

    function validateIP(ip) {
      var nums = ip.split('.');
      var numsValues = _.every(nums,
        function (num) {
          return num;
        }
      );
      if (!nums || !numsValues || nums.length !== 4)
        return 'has-error';
    }

    function validateWorkerAddress(ip) {
      var validWorkerIP = $scope.vm.validateIP(ip);

      if ($scope.vm.initializeForm.workers.newWorker.address.length &&
        (validWorkerIP !== 'has-error'))
        return '';

      if ($scope.vm.initializeForm.workers.workers.length &&
        !$scope.vm.initializeForm.workers.newWorker.address.length)
        return '';

      return 'has-error';
    }

    function initialize() {
      $scope.vm.initializing = true;

      async.series([
          validateUserInput,
          saveInstallerKeys,
          postDBInitialize
        ],
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            return horn.error(err);
          }

          pollService('db', postAndInitSecrets);
        }
      );
    }

    function validateUserInput (next) {
      var validationErrors = [];
      if ($scope.vm.initializeForm.msg.password.length < 8)
        validationErrors.push(
          'Messaging requires a password of 8 or more characters'
        );
      if ($scope.vm.initializeForm.state.rootPassword.length < 8)
        validationErrors.push(
          'State requires a password of 8 or more characters'
        );

      if (!_.isEmpty(validationErrors))
        return next(validationErrors.join(','));
      return next();
    }

    function saveInstallerKeys(next) {
      admiralApiAdapter.putAdmiralEnv({
          ACCESS_KEY: $scope.vm.initializeForm.installerAccessKey,
          SECRET_KEY: $scope.vm.initializeForm.installerSecretKey
        },
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function postDBInitialize(next) {
      admiralApiAdapter.postDB({},
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function pollService(serviceName, callback) {
      var promise = $interval(function () {
        getSystemSettings({},
          function (err) {
            if (err) {
              $interval.cancel(promise);
              $scope.vm.initializing = false;
              return horn.error(err);
            }

            var service = $scope.vm.systemSettings[serviceName];

            if (!service.isProcessing &&
              (service.isFailed || service.isInitialized)) {
              $interval.cancel(promise);
              if (service.isFailed &&
                (serviceName === 'db' || serviceName === 'secrets'))
                $scope.vm.initializing = false;
              else
                callback();
            }
          }
        );
      }, 3000);
    }


    function postAndInitSecrets() {
      var secretsUpdate = {
        address: $scope.vm.admiralEnv.ADMIRAL_IP,
        isShippableManaged: true
      };

      if ($scope.vm.initializeForm.secrets.initType === 'new')
        secretsUpdate.address = $scope.vm.initializeForm.secrets.address;

      if ($scope.vm.initializeForm.secrets.initType === 'existing') {
        secretsUpdate.address = $scope.vm.initializeForm.secrets.address;
        secretsUpdate.rootToken = $scope.vm.initializeForm.secrets.rootToken;
        secretsUpdate.isShippableManaged = false;
      }

      async.series([
          // get secrets, msg, state, redis, master, workers
          getCoreServices,
          postSecrets.bind(null, secretsUpdate),
          initSecrets,
          getAdmiralEnv.bind(null, {})
        ],
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            return horn.error(err);
          }

          pollService('secrets', postServices);
        }
      );
    }

    function getCoreServices(next) {
      var coreServices =
        ['secrets', 'msg', 'state', 'redis', 'master', 'workers'];
      async.each(coreServices,
        function (service, done) {
          admiralApiAdapter.getCoreService(service,
            function (err) {
              if (err)
                return done(err);
              done();
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function postSecrets(update, next) {
      admiralApiAdapter.postSecrets(update,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function initSecrets(next) {
      $scope.vm.systemSettings.secrets.isProcessing = true;

      admiralApiAdapter.initSecrets({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.secrets.isProcessing = false;
            $scope.vm.initializing = false;
            return next(err);
          }
          return next();
        }
      );
    }

    function postServices() {
      /* jshint maxcomplexity:15 */
      var msgUpdate = {
        address: $scope.vm.admiralEnv.ADMIRAL_IP,
        username: 'shippableRoot',
        password: $scope.vm.initializeForm.msg.password,
        isSecure: false,
        isShippableManaged: true
      };
      var stateUpdate = {
        address: $scope.vm.admiralEnv.ADMIRAL_IP,
        rootPassword: $scope.vm.initializeForm.state.rootPassword,
        sshPort: 2222,
        isShippableManaged: true
      };
      var redisUpdate = {
        address: $scope.vm.admiralEnv.ADMIRAL_IP,
        isShippableManaged: true
      };
      var masterUpdate = {
        address: $scope.vm.admiralEnv.ADMIRAL_IP
      };
      var workersList = [
        {
          address: $scope.vm.admiralEnv.ADMIRAL_IP,
          name: 'worker'
        }
      ];

      // if the user had tried to add a new worker, then switched to
      // an admiral initType, remove any non-admiral workers
      var deletedWorkers =
        $scope.vm.initializeForm.workers.deletedWorkers.concat(
          _.filter($scope.vm.initializeForm.workers.workers,
            function (worker) {
              return worker.address !== $scope.vm.admiralEnv.ADMIRAL_IP;
            }
          )
        );

      if ($scope.vm.initializeForm.msg.initType === 'new')
        msgUpdate.address = $scope.vm.initializeForm.msg.address;

      if ($scope.vm.initializeForm.state.initType === 'new') {
        stateUpdate.address = $scope.vm.initializeForm.state.address;
        stateUpdate.sshPort = 22;
      }

      if ($scope.vm.initializeForm.redis.initType === 'new')
        redisUpdate.address = $scope.vm.initializeForm.redis.address;

      if ($scope.vm.initializeForm.workers.initType === 'new') {
        workersList = $scope.vm.initializeForm.workers.workers;
        deletedWorkers = $scope.vm.initializeForm.workers.deletedWorkers;
      }

      if ($scope.vm.initializeForm.msg.initType === 'existing') {
        msgUpdate.address = $scope.vm.initializeForm.msg.address;
        msgUpdate.username = $scope.vm.initializeForm.msg.username;
        msgUpdate.isSecure = $scope.vm.initializeForm.msg.isSecure;
        msgUpdate.isShippableManaged = false;
      }

      if ($scope.vm.initializeForm.state.initType === 'existing') {
        stateUpdate.address = $scope.vm.initializeForm.state.address;
        stateUpdate.sshPort = 22;
        stateUpdate.isShippableManaged = false;
      }

      if ($scope.vm.initializeForm.redis.initType === 'existing') {
        redisUpdate.address = $scope.vm.initializeForm.redis.address;
        redisUpdate.isShippableManaged = false;
      }

      // Set the correct password if RabbitMQ has already been initialized,
      // even if it's Shippable managed:
      if ($scope.vm.systemSettings.msg.isInitialized) {
        msgUpdate.username = $scope.vm.initializeForm.msg.username ||
          'shippableRoot';
        msgUpdate.isSecure = $scope.vm.initializeForm.msg.isSecure || false;
      }

      // Set the correct port if GitLab has already been initialized,
      // even if it's Shippable managed:
      if ($scope.vm.systemSettings.state.isInitialized)
        stateUpdate.sshPort = $scope.vm.initializeForm.state.sshPort ||
          ($scope.vm.initializeForm.state.initType === 'admiral' ? 2222 : 22);

      async.series([
          postMsg.bind(null, msgUpdate),
          postState.bind(null, stateUpdate),
          postRedis.bind(null, redisUpdate),
          postMaster.bind(null, masterUpdate),
          postWorkers.bind(null, workersList),
          deleteWorkers.bind(null, deletedWorkers),
          getSystemSettings.bind(null, {}),
          updateInitializeForm.bind(null, {}),
          updateInstallForm.bind(null, workersList)
        ],
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            return horn.error(err);
          }

          initMsg();
        }
      );
    }

    function postMsg(update, next) {
      if ($scope.vm.systemSettings.msg.isInitialized) return next();

      admiralApiAdapter.postMsg(update,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function postState(update, next) {
      admiralApiAdapter.postState(update,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function postRedis(update, next) {
      admiralApiAdapter.postRedis(update,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function postMaster(update, next) {
      admiralApiAdapter.postMaster(update,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function postWorkers(workers, next) {
      async.eachSeries(workers,
        function (worker, done) {
          admiralApiAdapter.postWorker(worker,
            function (err) {
              if (err)
                return done(err);
              return done();
            }
          );
        },
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function deleteWorkers(workers, next) {
      async.eachSeries(workers,
        function (worker, done) {
          admiralApiAdapter.deleteWorker(worker.name, {},
            function (err) {
              if (err)
                return done(err);
              return done();
            }
          );
        },
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function initMsg() {
      $scope.vm.systemSettings.msg.isProcessing = true;

      admiralApiAdapter.initMsg({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.msg.isProcessing = false;
            $scope.vm.initializing = false;
            return horn.error(err);
          }

          pollService('msg', initState);
        }
      );
    }

    function initState() {
      $scope.vm.systemSettings.state.isProcessing = true;

      admiralApiAdapter.initState({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.state.isProcessing = false;
            $scope.vm.initializing = false;
            return horn.error(err);
          }

          pollService('state', initRedis);
        }
      );
    }

    function initRedis() {
      $scope.vm.systemSettings.redis.isProcessing = true;
      admiralApiAdapter.initRedis({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.redis.isProcessing = false;
            $scope.vm.initializing = false;
            return horn.error(err);
          }

          pollService('redis', initMaster);
        }
      );
    }

    function initMaster() {
      $scope.vm.systemSettings.master.isProcessing = true;
      admiralApiAdapter.initMaster({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.master.isProcessing = false;
            $scope.vm.initializing = false;
            return horn.error(err);
          }

          pollService('master', initWorkers);
        }
      );
    }

    function initWorkers() {
      $scope.vm.initializeForm.workers.enableLogsButton = true;
      async.eachSeries($scope.vm.initializeForm.workers.workers,
        function (worker, done) {

          async.series([
              initializeWorker.bind(null, worker),
              pollWorker.bind(null, worker)
            ],
            function (err) {
              if (err)
                return done(err);
              return done();
            }
          );
        },
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            return horn.error(err);
          }
          postInitFlow();
        }
      );
    }

    function initializeWorker(worker, next) {
      admiralApiAdapter.initWorker(worker,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function pollWorker(worker, next) {
      var promise = $interval(function () {
        getSystemSettings({},
          function (err) {
            if (err) {
              $interval.cancel(promise);
              $scope.vm.initializing = false;
              return next(err);
            }

            var systemSettingsWorker =
              _.findWhere($scope.vm.systemSettings.workers, {name:worker.name});

            if (!systemSettingsWorker.isProcessing &&
              (systemSettingsWorker.isFailed ||
              systemSettingsWorker.isInitialized)) {
              $interval.cancel(promise);
              return next();
            }
          }
        );
      }, 3000);
    }

    function postInitFlow() {
      async.parallel([
          getSystemIntegrations.bind(null, {}),
          getSystemSettingsForInstallPanel.bind(null, {}),
          getServices.bind(null, {}),
          getSystemMachineImages,
          getMasterIntegrations.bind(null, {}),
          updateInitializeForm.bind(null, {}),
          updateAddonsFormSystemIntegrations
        ],
        function (err) {
          if (err)
            horn.error(err);
          $scope.vm.initializing = false;
        }
      );
    }

    function addWorker(worker) {
      var nameInUse = _.some($scope.vm.initializeForm.workers.workers,
        function (existingWorker) {
          return existingWorker.name === worker.name;
        }
      );

      if (nameInUse) {
        horn.error('A swarm worker already exists with that name. ' +
          'Worker names must be unique.'
        );
        return;
      }

      var addressInUse = _.some($scope.vm.initializeForm.workers.workers,
        function (existingWorker) {
          return existingWorker.address === worker.address;
        }
      );

      if (addressInUse) {
        horn.error('A swarm worker already exists with that address. ' +
          'Worker addresses must be unique.'
        );
        return;
      }

      $scope.vm.initializeForm.workers.workers.push(worker);
      $scope.vm.initializeForm.workers.newWorker = {
        name: '',
        address: ''
      };
    }

    function removeWorker (worker) {
      $scope.vm.initializeForm.workers.deletedWorkers.push(worker);
      $scope.vm.initializeForm.workers.workers =
        _.without($scope.vm.initializeForm.workers.workers,
          _.findWhere($scope.vm.initializeForm.workers.workers,
            {name: worker.name})
        );
    }

    function addSystemMachineImage() {
      var newSystemMachineImage = {
        externalId: '',
        provider: 'AWS',
        name: '',
        description: '',
        isAvailable: true,
        isDefault: false,
        region: '',
        keyName: '',
        runShImage: '',
        securityGroup: '',
        subnetId: '',
        drydockTag: '',
        drydockFamily: '',
        sshUser: 'ubuntu',
        sshPort: 22
      };

      $scope.vm.installForm.systemMachineImages.push(newSystemMachineImage);
    }

    function removeSystemMachineImage(image) {
      $scope.vm.installForm.systemMachineImages =
        _.without($scope.vm.installForm.systemMachineImages, image);
    }

    function upgrade() {
      $scope.vm.upgrading = true;
      var bag = {};
      async.series([
          updateReleaseVersion.bind(null, bag),
          getEnabledServices.bind(null, bag),
          deleteAddonServices.bind(null, bag),
          postDB.bind(null, bag),
          deleteCoreServices.bind(null, bag),
          startAPIService.bind(null, bag),
          startCoreServices.bind(null, bag),
          startNexecService.bind(null, bag),
          startAddonServices.bind(null, bag),
          runPostMigrationScripts.bind(null, bag),
          getSystemSettings.bind(null, bag),
          getServices.bind(null, bag)
        ],
        function (err) {
          $scope.vm.upgrading = false;
          if (err)
            return horn.error(err);
        }
      );
    }

    function updateReleaseVersion(bag, next) {
      if (!$scope.vm.systemSettingsId) return next();

      var update = {
        releaseVersion: $scope.vm.admiralEnv.RELEASE
      };

      admiralApiAdapter.putSystemSettings($scope.vm.systemSettingsId, update,
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function getEnabledServices(bag, next) {
      admiralApiAdapter.getServices('',
        function (err, services) {
          if (err)
            return next(err);

          bag.enabledCoreServices = _.filter(services,
            function (service) {
              return service.isEnabled && service.isCore;
            }
          );

          bag.enabledAddonServices = _.filter(services,
            function (service) {
              return service.isEnabled && !service.isCore;
            }
          );

          return next();
        }
      );
    }

    function deleteAddonServices(bag, next) {
      async.eachSeries(bag.enabledAddonServices,
        function (addonService, done) {
          admiralApiAdapter.deleteService(addonService.serviceName,
            {isEnabled: true},
            function (err) {
              if (err)
                return done(err);

              return done();
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function postDB(bag, next) {
      admiralApiAdapter.postDB({},
        function (err) {
          if (err)
            return next(err);

          var promise = $interval(function () {
            getSystemSettings({},
              function (err) {
                if (err) {
                  $interval.cancel(promise);
                  return next(err);
                }

                var db = $scope.vm.systemSettings.db;

                if (!db.isProcessing && (db.isFailed || db.isInitialized)) {
                  $interval.cancel(promise);
                  return next();
                }
              }
            );
          }, 3000);
        }
      );
    }

    function deleteCoreServices(bag, next) {
      async.eachSeries(bag.enabledCoreServices,
        function (coreService, done) {
          admiralApiAdapter.deleteService(coreService.serviceName,
            {isEnabled: true},
            function (err) {
              if (err)
                return done(err);

              return done();
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function deleteInternalAPIService(bag, next) {
      var body = {
        isEnabled: $scope.vm.installForm.internalAPI.url.isEnabled
      };
      admiralApiAdapter.deleteService('internalAPI', body,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function deleteConsoleAPIService(bag, next) {
      var body = {
        isEnabled: $scope.vm.installForm.consoleAPI.url.isEnabled
      };
      admiralApiAdapter.deleteService('consoleAPI', body,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function startAPIService(bag, next) {
      // Start API first because the other services need it
      var apiService = _.findWhere(bag.enabledCoreServices,
        {serviceName: 'api'});

      if (!apiService) return next();

      var body = {
        name: apiService.serviceName,
        replicas: apiService.replicas
      };

      admiralApiAdapter.postService(body,
        function (err) {
          return next(err);
        }
      );
    }

    function startCoreServices(bag, next) {
      async.eachSeries(bag.enabledCoreServices,
        function (coreService, done) {
          if (coreService.serviceName === 'api') // Started in previous function
            return done();

          if (coreService.serviceName === 'nexec') // Will start last
            return done();

          var body = {
            name: coreService.serviceName,
            replicas: coreService.replicas
          };

          admiralApiAdapter.postService(body,
            function (err) {
              return done(err);
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function startNexecService(bag, next) {
      var nexec = _.findWhere(bag.enabledCoreServices, {serviceName: 'nexec'});
      if (!nexec)
        return next();

      var body = {
        name: nexec.serviceName,
        replicas: nexec.replicas
      };

      // Allow ten seconds for API
      var promise = $interval(function () {
        $interval.cancel(promise);

        admiralApiAdapter.postService(body,
          function (err) {
            return next(err);
          }
        );
      }, 10000);
    }

    function startAddonServices(bag, next) {
      async.eachSeries(bag.enabledAddonServices,
        function (addonService, done) {
          var body = {
            name: addonService.serviceName,
            replicas: addonService.replicas
          };

          admiralApiAdapter.postService(body,
            function (err) {
              return done(err);
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function runPostMigrationScripts(bag, next) {
      admiralApiAdapter.postDBCleanup({},
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function install() {
      $scope.vm.installing = true;

      async.series([
          validateInstallForm,
          updateSSHKeysSystemIntegration,
          updateAPISystemIntegration,
          updateInternalAPISystemIntegration,
          updateConsoleAPISystemIntegration,
          updateWWWSystemIntegration,
          updateAuthSystemIntegrations,
          enableSCMMasterIntegrations,
          updateMktgSystemIntegration,
          updateMsgSystemIntegration,
          updateRedisSystemIntegration,
          updateStateSystemIntegration,
          updateGmailSystemIntegration,
          updateMailgunSystemIntegration,
          updateSMTPSystemIntegration,
          enableEmailMasterIntegration,
          updateInstallPanelSystemSettings,
          getMasterIntegrations.bind(null, {}),
          updateProvisionSystemIntegration,
          updateSystemMachineImages,
          startAPI,
          startInternalAPI,
          startConsoleAPI,
          startWWW,
          startSync,
          startMktg,
          startJobRequest,
          startJobTrigger,
          updateFilestoreSystemIntegration,
          startNf,
          startCharon,
          startDeploy,
          startManifest,
          startRelease,
          startRSync,
          startTimeTrigger,
          startVersionTrigger,
          startCron,
          startNexec
        ],
        function (err) {
          $scope.vm.installing = false;
          if (err)
            horn.error(err);

          // Check if we should show "Install" or "Save" and "Restart Services"
          getServices({},
            function (err) {
              if (err)
                return horn.error(err);
            }
          );
          getSuperUsers(
            function (err) {
              if (err)
                return horn.error(err);
            }
          );
          getSystemNodes(
            function (err) {
              if (err)
                return horn.error(err);
            }
          );
        }
      );
    }

    function save() {
      $scope.vm.saving = true;
      hideSaveModal();

      async.series([
          validateInstallForm,
          updateSSHKeysSystemIntegration,
          updateAPISystemIntegration,
          updateInternalAPISystemIntegration,
          updateConsoleAPISystemIntegration,
          updateWWWSystemIntegration,
          updateAuthSystemIntegrations,
          enableSCMMasterIntegrations,
          updateMktgSystemIntegration,
          updateMsgSystemIntegration,
          updateRedisSystemIntegration,
          updateStateSystemIntegration,
          updateGmailSystemIntegration,
          updateMailgunSystemIntegration,
          updateSMTPSystemIntegration,
          enableEmailMasterIntegration,
          updateInstallPanelSystemSettings,
          getMasterIntegrations.bind(null, {}),
          updateProvisionSystemIntegration,
          updateSystemMachineImages,
          updateFilestoreSystemIntegration,
          updateInternalAPIService,
          updateConsoleAPIService
        ],
        function (err) {
          $scope.vm.saving = false;
          if (err)
            horn.error(err);

          // Check if we should show "Install" or "Save" and "Restart Services"
          getServices({},
            function (err) {
              if (err)
                return horn.error(err);
            }
          );
          getSuperUsers(
            function (err) {
              if (err)
                return horn.error(err);
            }
          );
          getSystemNodes(
            function (err) {
              if (err)
                return horn.error(err);
            }
          );
        }
      );
    }

    function restartServices() {
      $scope.vm.restartingServices = true;
      hideRestartServicesModal();

      var bag = {};
      async.series([
          getEnabledServices.bind(null, bag),
          deleteAddonServices.bind(null, bag),
          deleteCoreServices.bind(null, bag),
          deleteInternalAPIService.bind(null, bag),
          deleteConsoleAPIService.bind(null, bag),
          startAPIService.bind(null, bag),
          startCoreServices.bind(null, bag),
          startNexecService.bind(null, bag),
          startAddonServices.bind(null, bag)
        ],
        function (err) {
          $scope.vm.restartingServices = false;
          if (err)
            horn.error(err);

          // Check if we should show "Install" or "Save" and "Restart Services"
          getServices({},
            function (err) {
              if (err)
                return horn.error(err);
            }
          );
        }
      );
    }

    function saveServices() {
      $scope.vm.saving = true;
      hideSaveServicesModal();

      async.eachSeries($scope.vm.allServices,
        function (service, done) {
          admiralApiAdapter.putService(service.serviceName, service,
            function (err) {
              if (err)
                horn.error(err);
              return done();
            }
          );
        },
        function (err) {
          $scope.vm.saving = false;
          if (err)
            return horn.error(err);
        }
      );
    }

    function updateFilestoreSystemIntegration(next) {
      var bag = {
        name: 'filestore',
        masterName: $scope.vm.installForm.filestore.amazonKeys.masterName,
        data: $scope.vm.installForm.filestore.amazonKeys.data,
        isEnabled: $scope.vm.installForm.filestore.amazonKeys.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }


    function updateInternalAPIService(next) {
      var internalAPIService = {};
      _.each($scope.vm.allServices,
        function(service) {
          if (service.serviceName === 'internalAPI')
            internalAPIService = service;
        }
      );

      internalAPIService.isEnabled =
        $scope.vm.installForm.internalAPI.url.isEnabled;

      admiralApiAdapter.putService('internalAPI', internalAPIService,
        function (err) {
          if (err)
            horn.error(err);
          return next();
        }
      );
    }

    function updateConsoleAPIService(next) {
      var consoleAPIService = {};
      _.each($scope.vm.allServices,
        function(service) {
          if (service.serviceName === 'consoleAPI')
            consoleAPIService = service;
        }
      );

      consoleAPIService.isEnabled =
        $scope.vm.installForm.consoleAPI.url.isEnabled;

      admiralApiAdapter.putService('consoleAPI', consoleAPIService,
        function (err) {
          if (err)
            horn.error(err);
          return next();
        }
      );
    }

    function validateInstallForm(next) {
      var validationErrors = [];
      if (_.isEmpty($scope.vm.installForm.api.url.data.url)) {
        validationErrors.push(
          'Please provide a valid API URL'
        );
      }
      if (_.isEmpty($scope.vm.installForm.www.url.data.url))
        validationErrors.push(
          'Please provide a valid Shippable UI URL'
        );

      if (!_.isEmpty(validationErrors))
        return next(validationErrors.join(','));
      return next();
    }

    function updateSSHKeysSystemIntegration(next) {
      if (!$scope.vm.machineKeys) return next();

      var bag = {
        name: 'sshKeys',
        masterName: $scope.vm.installForm.sshKeys['ssh-key'].masterName,
        data: {
          publicKey: $scope.vm.machineKeys.publicKey,
          privateKey: $scope.vm.machineKeys.privateKey
        },
        isEnabled: true
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateAPISystemIntegration(next) {
      var bag = {
        name: 'api',
        masterName: $scope.vm.installForm.api.url.masterName,
        data: $scope.vm.installForm.api.url.data,
        isEnabled: $scope.vm.installForm.api.url.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateInternalAPISystemIntegration(next) {
      var bag = {
        name: 'internalAPI',
        masterName: $scope.vm.installForm.internalAPI.url.masterName,
        data: $scope.vm.installForm.internalAPI.url.data,
        isEnabled: $scope.vm.installForm.internalAPI.url.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateConsoleAPISystemIntegration(next) {
      var bag = {
        name: 'consoleAPI',
        masterName: $scope.vm.installForm.consoleAPI.url.masterName,
        data: $scope.vm.installForm.consoleAPI.url.data,
        isEnabled: $scope.vm.installForm.consoleAPI.url.isEnabled
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
        masterName: $scope.vm.installForm.www.url.masterName,
        data: $scope.vm.installForm.www.url.data,
        isEnabled: $scope.vm.installForm.www.url.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateAuthSystemIntegrations(next) {
      async.each($scope.vm.installForm.auth,
        function (systemInt, done) {
          var bag = {
            name: 'auth',
            masterName: systemInt.masterName,
            data: systemInt.data,
            isEnabled: systemInt.isEnabled
          };

          bag.data.wwwUrl = $scope.vm.installForm.www.url.data.url;

          updateSystemIntegration(bag,
            function (err) {
              if (err)
                return done(err);
              if (bag.systemIntegrationId) {
                var providerAuthName = providerAuthNames[bag.masterName];
                if (!_.isEmpty(providerAuthName)) {
                  $scope.vm.installForm[bag.name][bag.masterName].callbackUrl =
                    bag.data.wwwUrl + '/auth/' + providerAuthName +
                    '/' + bag.systemIntegrationId + '/identify';
                }
              }
              return done();

            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function updateMktgSystemIntegration(next) {
      var bag = {
        name: 'mktg',
        masterName: $scope.vm.installForm.mktg.url.masterName,
        data: $scope.vm.installForm.mktg.url.data,
        isEnabled: $scope.vm.installForm.mktg.url.isEnabled
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
        masterName: $scope.vm.installForm.msg.rabbitmqCreds.masterName,
        data: $scope.vm.installForm.msg.rabbitmqCreds.data,
        isEnabled: $scope.vm.installForm.msg.rabbitmqCreds.isEnabled
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
        masterName: $scope.vm.installForm.redis.url.masterName,
        data: $scope.vm.installForm.redis.url.data,
        isEnabled: $scope.vm.installForm.redis.url.isEnabled
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
        masterName: $scope.vm.installForm.state.gitlabCreds.masterName,
        data: $scope.vm.installForm.state.gitlabCreds.data,
        isEnabled: $scope.vm.installForm.state.gitlabCreds.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateGmailSystemIntegration(next) {
      var bag = {
        name: 'notification',
        masterName: $scope.vm.installForm.notification.gmailCreds.masterName,
        data: $scope.vm.installForm.notification.gmailCreds.data,
        isEnabled: $scope.vm.installForm.notification.gmailCreds.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateMailgunSystemIntegration(next) {
      var bag = {
        name: 'notification',
        masterName: $scope.vm.installForm.notification.mailgunCreds.masterName,
        data: $scope.vm.installForm.notification.mailgunCreds.data,
        isEnabled: $scope.vm.installForm.notification.mailgunCreds.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function updateSMTPSystemIntegration(next) {
      var bag = {
        name: 'notification',
        masterName: $scope.vm.installForm.notification.smtpCreds.masterName,
        data: $scope.vm.installForm.notification.smtpCreds.data,
        isEnabled: $scope.vm.installForm.notification.smtpCreds.isEnabled
      };

      updateSystemIntegration(bag,
        function (err) {
          return next(err);
        }
      );
    }

    function enableEmailMasterIntegration(next) {
      var enable = $scope.vm.installForm.notification.smtpCreds.isEnabled ||
        $scope.vm.installForm.notification.gmailCreds.isEnabled ||
        $scope.vm.installForm.notification.smtpCreds.isEnabled;

      var masterInt =
        _.findWhere($scope.vm.masterIntegrations, {name: 'Email'});

      if (!masterInt)
        return next('No email masterIntegration found');

      var update = {
        isEnabled: enable
      };

      admiralApiAdapter.putMasterIntegration(masterInt.id, update,
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function updateProvisionSystemIntegration(next) {
      var bag = {
        name: 'provision',
        masterName: $scope.vm.installForm.provision.amazonKeys.masterName,
        data: $scope.vm.installForm.provision.amazonKeys.data,
        isEnabled: $scope.vm.installForm.provision.amazonKeys.isEnabled
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
        function (err, sysInt) {
          if (err)
            return next(err);
          bag.systemIntegrationId = sysInt.id;

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

          var sysIntName = bag.name;
          var masterName = bag.masterName;

          if (!sysIntName || ! masterName) return next();

          if ($scope.vm.installForm[sysIntName] &&
            $scope.vm.installForm[sysIntName][masterName]) {
            resetSystemIntegration(sysIntName, masterName);
            $scope.vm.installForm[sysIntName][masterName].isEnabled = false;
          } else if ($scope.vm.addonsForm.systemIntegrations[sysIntName] &&
            $scope.vm.addonsForm.systemIntegrations[sysIntName].masterName ===
            masterName) {
            _.extend($scope.vm.addonsForm.systemIntegrations[sysIntName].data,
              systemIntDataDefaults[sysIntName][masterName]);
            $scope.vm.addonsForm.systemIntegrations[sysIntName].isEnabled =
              false;
          }

          return next();
        }
      );
    }

    function resetSystemIntegration(sysIntName, masterName) {
      if (!sysIntName || !masterName) return;
      _.extend($scope.vm.installForm[sysIntName][masterName].data,
        systemIntDataDefaults[sysIntName][masterName]);
    }

    function enableSCMMasterIntegrations(next) {
      async.eachOfSeries($scope.vm.installForm.scm,
        function (scmObject, scmName, done) {
          var masterInt =
            _.findWhere($scope.vm.masterIntegrations, {name: scmName});

          if (!masterInt)
            return next('No scm masterIntegration found for ' +
              scmName);

          var update = {
            isEnabled: scmObject.isEnabled
          };

          admiralApiAdapter.putMasterIntegration(masterInt.id, update,
            function (err) {
              if (err)
                return done(err);

              return done();
            }
          );
        },
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function updateInstallPanelSystemSettings(next) {
      if (!$scope.vm.systemSettingsId) return next();

      var update = $scope.vm.installForm.systemSettings;

      admiralApiAdapter.putSystemSettings($scope.vm.systemSettingsId, update,
        function (err) {
          if (err)
            return next(err);

          $scope.vm.runMode = update.runMode;
          return next();
        }
      );
    }

    function updateSystemMachineImages(next) {
      if (!$scope.vm.installForm.systemMachineImages) return next();

      var bag = {
        updatedSystemMachineImages: $scope.vm.installForm.systemMachineImages,
        currentSystemMachineImages: []
      };

      async.series([
          getCurrentSystemMachineImages.bind(null, bag),
          deleteSystemMachineImages.bind(null, bag),
          putSystemMachineImages.bind(null, bag),
          postSystemMachineImages.bind(null, bag),
          getSystemMachineImages
        ],
        function (err) {
          return next(err);
        }
      );
    }

    function getCurrentSystemMachineImages(bag, next) {
      admiralApiAdapter.getSystemMachineImages('',
        function (err, systemMachineImages) {
          if (err)
            return next(err);

          bag.currentSystemMachineImages = systemMachineImages;
          return next();
        }
      );
    }

    function deleteSystemMachineImages(bag, next) {
      var deletedSystemMachineImages = _.filter(bag.currentSystemMachineImages,
        function (currentImage) {
          var exists =
            _.findWhere(bag.updatedSystemMachineImages, {id: currentImage.id});
          return !exists;
        }
      );

      async.eachSeries(deletedSystemMachineImages,
        function (deletedImage, done) {
          admiralApiAdapter.deleteSystemMachineImage(deletedImage.id,
            function (err) {
              if (err)
                return done(err);

              return done();
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function putSystemMachineImages(bag, next) {
      var updatedSystemMachineImages = _.filter(bag.updatedSystemMachineImages,
        function (updatedImage) {
          var exists =
            _.findWhere(bag.currentSystemMachineImages, {id: updatedImage.id});
          return exists;
        }
      );

      async.eachSeries(updatedSystemMachineImages,
        function (updatedImage, done) {
          var body = _.clone(updatedImage);
          if (body.subnetId === '')
            body.subnetId = null;

          var seriesBag = {
            id: updatedImage.id,
            body: body,
            accessKey: $scope.vm.installForm.provision.amazonKeys.data.accessKey,
            secretKey: $scope.vm.installForm.provision.amazonKeys.data.secretKey,
            region: body.region,
            amiId: body.externalId
          };
          async.series([
              __getImageByAmiId.bind(null, seriesBag),
              __putSystemMachineImage.bind(null, seriesBag)
            ],
            function (err) {
              return done(err);
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function postSystemMachineImages(bag, next) {

      var newSystemMachineImages = _.filter(bag.updatedSystemMachineImages,
        function (image) {
          var exists =
            _.findWhere(bag.currentSystemMachineImages, {id: image.id});
          return !exists;
        }
      );

      async.eachSeries(newSystemMachineImages,
        function (newImage, done) {
          var body = _.clone(newImage);
          if (body.subnetId === '')
            body.subnetId = null;

          var seriesBag = {
            body: body,
            accessKey: $scope.vm.installForm.provision.amazonKeys.data.accessKey,
            secretKey: $scope.vm.installForm.provision.amazonKeys.data.secretKey,
            region: body.region,
            amiId: body.externalId
          };
          async.series([
              __getImageByAmiId.bind(null, seriesBag),
              __postSystemMachineImage.bind(null, seriesBag)
            ],
            function (err) {
              return done(err);
            }
          );

        },
        function (err) {
          return next(err);
        }
      );
    }

    function __getImageByAmiId(bag, next) {
      if (!bag.secretKey || !bag.accessKey)
        return next();

      var query = 'region=' + bag.region;
      admiralApiAdapter.getImageByAmiId(bag.amiId, query,
        function (err, imageId) {
          if (err)
            return next(err);

          if (_.isEmpty(imageId))
            return next('Error: Entered ami-id is not correct');

          return next();
        }
      );
    }

    function __postSystemMachineImage(bag, next) {
      admiralApiAdapter.postSystemMachineImage(bag.body,
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function __putSystemMachineImage(bag, next) {
      admiralApiAdapter.putSystemMachineImage(bag.id, bag.body,
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startAPI(next) {
      startService('api',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startInternalAPI(next) {
      if (!$scope.vm.installForm.internalAPI.url.isEnabled) return next();
      startService('internalAPI',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startConsoleAPI(next) {
      if (!$scope.vm.installForm.consoleAPI.url.isEnabled) return next();
      startService('consoleAPI',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startWWW(next) {
      startService('www',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startSync(next) {
      startService('sync',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startMktg(next) {
      startService('mktg',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startJobRequest(next) {
      startService('jobRequest',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startJobTrigger(next) {
      startService('jobTrigger',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startNf(next) {
      startService('nf',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startCharon(next) {
      startService('charon',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startDeploy(next) {
      startService('deploy',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startManifest(next) {
      startService('manifest',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startRelease(next) {
      startService('release',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startRSync(next) {
      startService('rSync',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startTimeTrigger(next) {
      startService('timeTrigger',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startVersionTrigger(next) {
      startService('versionTrigger',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startCron(next) {
      startService('cron',
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function startNexec(next) {
      // Allow ten seconds for API
      var promise = $interval(function () {
        $interval.cancel(promise);

        startService('nexec',
          function (err) {
            if (err)
              return next(err);

            return next();
          }
        );
      }, 10000);
    }

    function startService(serviceName, callback) {
      var serviceConfig = _.find($scope.vm.allServices,
        function (service) {
          return service.serviceName === serviceName;
        }
      );

      if (!serviceConfig)
        return callback();

      var body = {
        name: serviceName,
        replicas: serviceConfig.replicas
      };

      admiralApiAdapter.postService(body,
        function (err) {
          return callback(err);
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
      $scope.vm.selectedService = $scope.vm.systemSettings[service];

      admiralApiAdapter.getCoreService(service,
        function (err, configs) {
          if (err)
            return horn.error(err);

          $scope.vm.selectedService.configs = [];

          _.each(configs,
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

    function showWorkersLogModal(service) {
      $scope.vm.selectedService = {};
      $scope.vm.selectedService.serviceName = service;
      $scope.vm.selectedService.displayName = 'Swarm Worker';
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

    function showSaveModal() {
      $('#saveModal').modal('show');
    }

    function hideSaveModal() {
      $('#saveModal').modal('hide');
    }

    function showSaveServicesModal() {
      $('#saveServicesModal').modal('show');
    }

    function hideSaveServicesModal() {
      $('#saveServicesModal').modal('hide');
    }

    function showRestartServicesModal() {
      $('#restartServicesModal').modal('show');
    }

    function hideRestartServicesModal() {
      $('#restartServicesModal').modal('hide');
    }

    function showEULAModal() {
      $scope.vm.eulaText = [];
      admiralApiAdapter.getEULAText(
        function (err, eula) {
          if (err)
            return horn.error(err);
          $scope.vm.eulaText = eula.join('\n');

          $('#eulaModal').modal('show');
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

    function installAddons() {
      $scope.vm.installingAddons = true;

      async.series([
          updateMasterIntegrations,
          updateAddonsPanelSystemSettings,
          updateAddonsPanelSystemIntegrations,
          getServices.bind(null, {})
        ],
        function (err) {
          $scope.vm.installingAddons = false;
          if (err)
            return horn.error(err);
          getMasterIntegrations({}, function () {});
        }
      );
    }

    function updateMasterIntegrations(next) {
      async.eachOfSeries($scope.vm.addonsForm,
        function (addonsMasterInt, masterIntName, done) {
          if (masterIntName === 'systemSettings' ||
            masterIntName === 'systemIntegrations')
            return done();

          var masterInt = _.find($scope.vm.masterIntegrations,
            function (masterInt) {
              return masterInt.name === masterIntName;
            }
          );

          if (!masterInt)
            return done('No master integration found for: ' + masterIntName);

          var update = {
            isEnabled: addonsMasterInt.isEnabled
          };

          admiralApiAdapter.putMasterIntegration(masterInt.id, update,
            function (err) {
              return done(err);
            }
          );
        },
        function (err) {
          return next(err);
        }
      );
    }

    function updateAddonsPanelSystemSettings(next) {
      if (!$scope.vm.systemSettingsId) return next();

      var update = $scope.vm.addonsForm.systemSettings;

      admiralApiAdapter.putSystemSettings($scope.vm.systemSettingsId, update,
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function updateAddonsPanelSystemIntegrations(next) {
      async.eachSeries($scope.vm.addonsForm.systemIntegrations,
        function (systemIntegration, done) {
          var bag = {
            name: systemIntegration.name,
            masterName: systemIntegration.masterName,
            data: systemIntegration.data,
            isEnabled: systemIntegration.isEnabled
          };

          updateSystemIntegration(bag,
            function (err) {
              return done(err);
            }
          );
        },
        function (err) {
          if (err)
            horn.error(err);
          return next();
        }
      );
    }

    $scope.$watch('vm.installForm.www.url.data.url',
      function () {
        _.each($scope.vm.installForm.auth,
          function (auth) {
            if (auth.callbackUrl) {
              var url = auth.callbackUrl;
              auth.callbackUrl = $scope.vm.installForm.www.url.data.url +
                '/auth/' + url.split('/auth/')[1];
            }
          }
        );
      }
    );

    function toggleAuthProvider(providerName) {
      var systemInt = $scope.vm.installForm.auth[providerName + 'Keys'];

      $scope.vm.installForm.scm[providerName].isEnabled = systemInt.isEnabled;

      var bag = {
        name: 'auth',
        masterName: systemInt.masterName,
        data: systemInt.data,
        isEnabled: systemInt.isEnabled
      };

      bag.data.wwwUrl = $scope.vm.installForm.www.url.data.url;

      if (systemInt.isEnabled) {
        async.series([
            getSystemIntegration.bind(null, bag),
            postSystemIntegration.bind(null, bag)
          ],
          function (err) {
            if (err)
              return horn.error(err);
            if (bag.systemIntegrationId) {
              var providerAuthName = providerAuthNames[bag.masterName];
              if (!_.isEmpty(providerAuthName))
                $scope.vm.installForm[bag.name][bag.masterName].callbackUrl =
                  bag.data.wwwUrl + '/auth/' + providerAuthName +
                  '/' + bag.systemIntegrationId + '/identify';
            }
          }
        );
      } else {
        if (systemInt.data.clientId !== '' ||
          systemInt.data.clientSecret !== '')
          return;

        async.series([
            getSystemIntegration.bind(null, bag),
            deleteSystemIntegration.bind(null, bag)
          ],
          function (err) {
            if (err)
              return horn.error(err);
          }
        );
      }
    }

    function addSuperUser() {
      $scope.vm.superUsers.addingSuperUser = true;

      async.series([
          postSuperUser,
          getSuperUsers
        ],
        function (err) {
          $scope.vm.superUsers.addingSuperUser = false;
          $scope.vm.superUsers.newSuperUser = '';
          if (err)
            horn.error(err);
        }
      );
    }

    function removeSuperUser(removedSuperUser) {
      $scope.vm.superUsers.deletingSuperUser = true;

      var bag = {
        accountId: removedSuperUser
      };

      async.series([
          deleteSuperUsers.bind(null, bag),
          getSuperUsers
        ],
        function (err) {
          $scope.vm.superUsers.deletingSuperUser = false;
          if (err)
            horn.error(err);
        }
      );
    }

    function postSuperUser(next) {
      var newSuperUser = {
        accountId: $scope.vm.superUsers.newSuperUser
      };
      admiralApiAdapter.postSuperUser(newSuperUser,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function getSuperUsers(next) {
      if (!$scope.vm.systemSettings.db.isInitialized) return next();

      admiralApiAdapter.getSuperUsers(
        function (err, superUsers) {
          if (err)
            horn.error(err);
          $scope.vm.superUsers.superUsers = superUsers;
          return next();
        }
      );
    }

    function getSystemNodes(next) {
      if (!$scope.vm.systemSettings.db.isInitialized) return next();
      if ($scope.vm.runMode !== 'dev')
        return next();

      admiralApiAdapter.getSystemNodes('',
        function (err, systemNodes) {
          if (err) return horn.error(err);

          $scope.vm.systemNodes.systemNodes = systemNodes;
          return next();
        }
      );
    }

    function deleteSuperUsers(bag, next) {
      admiralApiAdapter.deleteSuperUser(bag.accountId,
        function (err) {
          if (err)
            return next(err);
          return next();
        }
      );
    }

    function addSystemNode() {
      $scope.vm.systemNodes.addingSystemNode = true;

      var bag = {
        systemNode: null,
        name: $scope.vm.systemNodes.friendlyName
      };
      async.series([
          postSystemNode.bind(null, bag),
          initializeSystemNode.bind(null, bag)
        ],
        function (err) {
          $scope.vm.systemNodes.addingSystemNode = false;
          if (err) return horn.error(err);

          $scope.vm.systemNodes.systemNodes.push(bag.systemNode);
        }
      );
    }

    function postSystemNode(bag, next) {
      var time = Date.now();
      var body = {
        friendlyName: 'system-node-' + time
      };
      admiralApiAdapter.postSystemNode(body,
        function (err, systemNode) {
          if (err) return next(err);

          bag.systemNode = systemNode;
          return next();
        }
      );
    }

    function initializeSystemNode(bag, next) {
      if (_.isEmpty(bag.systemNode)) return next();

      var body = {
        id: bag.systemNode.id
      };

      admiralApiAdapter.initializeSystemNode(body,
        function (err) {
          if (err) return next(err);

          return next();
        }
      );
    }

    function removeSystemNode(systemNode) {
      $scope.vm.systemNodes.deletingSystemNode = true;

      var bag = {
        systemNodeId: systemNode.id
      };
      async.series([
          deleteSystemNode.bind(null, bag)
        ],
        function (err) {
          $scope.vm.systemNodes.deletingSystemNode = false;
          if (err) return horn.error(err);

          $scope.vm.systemNodes.systemNodes = _.reject(
            $scope.vm.systemNodes.systemNodes,
            function (systemNode) {
              return systemNode.id === bag.systemNodeId;
            }
          );
        }
      );
    }

    function deleteSystemNode(bag, next) {
      admiralApiAdapter.deleteSystemNode(bag.systemNodeId,
        function (err, systemNode) {
          if (err) return next(err);

          bag.systemNodeId = systemNode.id;
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

    function isGlobalService(service) {
      return _.contains($scope.vm.globalServices, service);
    }

    function hasDefaultSystemMachineImage() {
      if (!$scope.vm.installForm.systemMachineImages ||
        !$scope.vm.installForm.systemMachineImages.length)
        return false;
      return _.some($scope.vm.installForm.systemMachineImages,
        function (systemMachineImage) {
          return systemMachineImage.isDefault;
        }
      );
    }
  }
}());
