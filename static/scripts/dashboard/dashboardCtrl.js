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
        auth: {
          bitbucketKeys: {
            isEnabled: false,
            masterName: 'bitbucketKeys',
            scmMasterName: 'bitbucket',
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
            scmMasterName: 'bitbucketServer',
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
            scmMasterName: 'github',
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
            scmMasterName: 'githubEnterprise',
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
            scmMasterName: 'gitlab',
            data: {
              clientId: '',
              clientSecret: '',
              wwwUrl: '',
              url: ''
            }
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
        www: {
          url: {
            isEnabled: true,
            masterName: 'url',
            data: {
              url: ''
            }
          }
        },
        defaultSystemMachineImage: {},
        systemSettings: [],
        coreServices: []
      },
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
        'ssh-key': {
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
        }
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
        }
      },
      systemSettingsId: null,
      selectedService: {},
      initialize: initialize,
      install: install,
      installAddons: installAddons,
      showAdmiralEnvModal: showAdmiralEnvModal,
      showConfigModal: showConfigModal,
      showLogModal: showLogModal,
      showDynamicNodeSettings: showDynamicNodeSettings,
      refreshLogs: refreshLogs,
      logOutOfAdmiral: logOutOfAdmiral
    };

    var systemIntDataDefaults = {};

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};

      async.series([
          setBreadcrumb.bind(null, bag),
          getSystemSettings.bind(null, bag),
          getAdmiralEnv.bind(null, bag),
          setupSystemIntDefaults.bind(null, bag),
          getSystemIntegrations.bind(null, bag),
          getMasterIntegrations.bind(null, bag),
          getSystemSettingsForInstallPanel.bind(null, bag),
          getServices.bind(null, bag),
          getDefaultSystemMachineImage.bind(null, bag)
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

          if ($scope.vm.systemSettings.msg.password)
            $scope.vm.initializeForm.msgPassword =
              $scope.vm.systemSettings.msg.password;

          if ($scope.vm.systemSettings.state.rootPassword)
            $scope.vm.initializeForm.statePassword =
              $scope.vm.systemSettings.state.rootPassword;

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

          if (admiralEnv.ACCESS_KEY)
            $scope.vm.initializeForm.accessKey = admiralEnv.ACCESS_KEY;

          if (admiralEnv.SECRET_KEY)
            $scope.vm.initializeForm.secretKey = admiralEnv.SECRET_KEY;

          return next();
        }
      );
    }

    function setupSystemIntDefaults(bag, next) {
      systemIntDataDefaults = {
        api: {
          url: {
            url: 'http://' + $scope.vm.admiralEnv.ADMIRAL_IP +
                ':50000'
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
            url: 'http://' + $scope.vm.admiralEnv.ADMIRAL_IP +
              ':50002'
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
        state: {
          gitlabCreds: {
            password: '',
            url: '',
            username: ''
          }
        },
        www: {
          url: {
            url: 'http://' + $scope.vm.admiralEnv.ADMIRAL_IP +
              ':50001'
          }
        }
      };

      return next();
    }

    function getSystemIntegrations(bag, next) {
      if (!$scope.vm.initialized) return next();

      // reset all systemIntegrations to their defaults
      _.each($scope.vm.installForm,
        function (systemInts, systemIntName) {
          if (systemIntName !== 'systemSettings' &&
            systemIntName !== 'defaultSystemMachineImage') {
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
              }
            }
          );

          return next();
        }
      );
    }

    function getMasterIntegrations(bag, next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getMasterIntegrations(
        function (err, masterIntegrations) {
          if (err) {
            horn.error(err);
            return next();
          }

          $scope.vm.masterIntegrations = masterIntegrations;

          _.each(masterIntegrations,
            function (masterInt) {
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

          var settings = [];

          settings.push({
            name: 'defaultMinionCount',
            value: systemSettings.defaultMinionCount,
            type: 'number'
          });

          settings.push({
            name: 'autoSelectBuilderToken',
            value: systemSettings.autoSelectBuilderToken,
            type: 'checkbox'
          });

          settings.push({
            name: 'buildTimeoutMS',
            value: systemSettings.buildTimeoutMS,
            type: 'number'
          });

          settings.push({
            name: 'defaultPrivateJobQuota',
            value: systemSettings.defaultPrivateJobQuota,
            type: 'number'
          });

          settings.push({
            name: 'serviceUserToken',
            value: systemSettings.serviceUserToken,
            type: 'text'
          });

          settings.push({
            name: 'runMode',
            value: systemSettings.runMode,
            type: 'text'
          });

          settings.push({
            name: 'allowSystemNodes',
            value: systemSettings.allowSystemNodes,
            type: 'checkbox'
          });

          settings.push({
            name: 'allowDynamicNodes',
            value: systemSettings.allowDynamicNodes,
            type: 'checkbox'
          });

          settings.push({
            name: 'allowCustomNodes',
            value: systemSettings.allowCustomNodes,
            type: 'checkbox'
          });

          settings.push({
            name: 'awsAccountId',
            value: systemSettings.awsAccountId,
            type: 'text'
          });

          settings.push({
            name: 'jobConsoleBatchSize',
            value: systemSettings.jobConsoleBatchSize,
            type: 'number'
          });

          settings.push({
            name: 'jobConsoleBufferTimeIntervalMS',
            value: systemSettings.jobConsoleBufferTimeIntervalMS,
            type: 'number'
          });

          settings.push({
            name: 'apiRetryIntervalMS',
            value: systemSettings.apiRetryIntervalMS,
            type: 'number'
          });

          settings.push({
            name: 'truck',
            value: systemSettings.truck,
            type: 'checkbox'
          });

          settings.push({
            name: 'hubspotListId',
            value: systemSettings.hubspotListId,
            type: 'number'
          });

          settings.push({
            name: 'hubspotShouldSimulate',
            value: systemSettings.hubspotShouldSimulate,
            type: 'checkbox'
          });

          settings.push({
            name: 'rootS3Bucket',
            value: systemSettings.rootS3Bucket,
            type: 'text'
          });

          settings.push({
            name: 'nodeScriptsLocation',
            value: systemSettings.nodeScriptsLocation,
            type: 'text'
          });

          settings.push({
            name: 'enforcePrivateJobQuota',
            value: systemSettings.enforcePrivateJobQuota,
            type: 'checkbox'
          });

          settings.push({
            name: 'technicalSupportAvailable',
            value: systemSettings.technicalSupportAvailable,
            type: 'checkbox'
          });

          settings.push({
            name: 'customNodesAdminOnly',
            value: systemSettings.customNodesAdminOnly,
            type: 'checkbox'
          });

          settings.push({
            name: 'allowedSystemImageFamily',
            value: systemSettings.allowedSystemImageFamily,
            type: 'text'
          });

          settings.push({
            name: 'releaseVersion',
            value: systemSettings.releaseVersion,
            type: 'text'
          });

          settings.push({
            name: 'defaultMinionInstanceSize',
            value: systemSettings.defaultMinionInstanceSize,
            type: 'text'
          });

          settings.push({
            name: 'mktgPageAggsLastDtTm',
            value: systemSettings.mktgPageAggsLastDtTm,
            type: 'datetime'
          });

          settings.push({
            name: 'mktgCTAAggsLastDtTm',
            value: systemSettings.mktgCTAAggsLastDtTm,
            type: 'datetime'
          });

          $scope.vm.installForm.systemSettings = settings;

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

          $scope.vm.coreServices = _.filter(services,
            function (service) {
              return service.isCore;
            }
          );

          return next();
        }
      );
    }

    function getDefaultSystemMachineImage(bag, next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemMachineImages(
        'isDefault=true&isAvailable=true',
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

          $scope.vm.installForm.defaultSystemMachineImage =
            systemMachineImages[0];

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
              getSystemSettingsForInstallPanel({},
                function (err) {
                  if (err)
                    horn.error(err);
                }
              );
              getServices({},
                function (err) {
                  if (err)
                    horn.error(err);
                }
              );
              getDefaultSystemMachineImage({},
                function (err) {
                  if (err)
                    horn.error(err);
                }
              );
              getMasterIntegrations({},
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
          updateFilestoreSystemIntegration,
          updateAPISystemIntegration,
          updateWWWSystemIntegration,
          updateAuthSystemIntegrations,
          updateMktgSystemIntegration,
          updateMsgSystemIntegration,
          updateRedisSystemIntegration,
          updateStateSystemIntegration,
          updateGmailSystemIntegration,
          updateMailgunSystemIntegration,
          updateSMTPSystemIntegration,
          enableEmailMasterIntegration,
          updateSystemSettings,
          updateProvisionSystemIntegration,
          getMasterIntegrations.bind(null, {}),
          updateDefaultSystemMachineImage,
          startAPI,
          startWWW,
          startSync,
          startMktg,
          startNexec,
          startJobRequest,
          startJobTrigger,
          startLogup,
          startNf,
          startCharon,
          startDeploy,
          startManifest,
          startRelease,
          startRSync,
          startTimeTrigger,
          startVersionTrigger,
          startCron
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
            scmMasterName: systemInt.scmMasterName,
            data: systemInt.data,
            isEnabled: systemInt.isEnabled
          };

          bag.data.wwwUrl = $scope.vm.installForm.www.url.data.url;

          async.series([
              updateSystemIntegration.bind(null, bag),
              enableSCMMasterIntegration.bind(null, bag)
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

      if (masterInt.isEnabled === enable)
        return next();

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

          var sysIntName = bag.name;
          var masterName = bag.masterName;

          if (!sysIntName || ! masterName) return next();

          resetSystemIntegration(sysIntName, masterName);
          $scope.vm.installForm[sysIntName][masterName].isEnabled = false;

          return next();
        }
      );
    }

    function resetSystemIntegration(sysIntName, masterName) {
      if (!sysIntName || !masterName) return;
      _.extend($scope.vm.installForm[sysIntName][masterName].data,
        systemIntDataDefaults[sysIntName][masterName]);
    }

    function enableSCMMasterIntegration(bag, callback) {
      var masterInt =
        _.findWhere($scope.vm.masterIntegrations, {name: bag.scmMasterName});

      if (!masterInt)
        return callback('No scm masterIntegration found for ' + bag.scmMasterName);

      if (masterInt.isEnabled) return callback();

      var update = {
        isEnabled: true
      };

      admiralApiAdapter.putMasterIntegration(masterInt.id, update,
        function (err, masterInt) {
          if (err)
            return callback(err);

          return callback();
        }
      );
    }

    function updateSystemSettings(next) {
      if (!$scope.vm.systemSettingsId) return next();

      var update = {};

      _.each($scope.vm.installForm.systemSettings,
        function (setting) {
          update[setting.name] = setting.value;
        }
      );

      admiralApiAdapter.putSystemSettings($scope.vm.systemSettingsId, update,
        function (err) {
          if (err)
            return next(err);

          return next();
        }
      );
    }

    function updateDefaultSystemMachineImage(next) {
      var image = $scope.vm.installForm.defaultSystemMachineImage;

      if (!image) return next();

      admiralApiAdapter.putSystemMachineImage(image.id, image,
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

    function startNexec(next) {
      startService('nexec',
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

    function startLogup(next) {
      startService('logup',
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

    function startService(serviceName, callback) {
      var serviceConfig = _.find($scope.vm.coreServices,
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

      admiralApiAdapter.getService(service,
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

      async.eachOfLimit($scope.vm.addonsForm, 10,
        function (addonsMasterInt, masterIntName, done) {
          var masterInt = _.find($scope.vm.masterIntegrations,
            function (masterInt) {
              return masterInt.name === masterIntName;
            }
          );

          if (!masterInt)
            return done('No master integration found for: ' + masterIntName);

          if (masterInt.isEnabled === addonsMasterInt.isEnabled)
            return done();

          var update = {
            isEnabled: addonsMasterInt.isEnabled
          };

          admiralApiAdapter.putMasterIntegration(masterInt.id, update,
            function (err, MI) {
              return done(err);
            }
          );
        },
        function (err) {
          $scope.vm.installingAddons = false;
          getMasterIntegrations({}, function () {});
          if (err)
            return horn.error(err);
        }
      );
    }

    function showDynamicNodeSettings() {
      var allowDynamicNodes =
        _.findWhere($scope.vm.installForm.systemSettings,
          {name: 'allowDynamicNodes'}
        );
      return allowDynamicNodes && allowDynamicNodes.value;
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
