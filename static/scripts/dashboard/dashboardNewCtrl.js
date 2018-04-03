(function () {
  'use strict';

  /* global _, async */

  admiral.controller('dashboardNewCtrl', ['$scope', '$stateParams', '$q', '$state',
    '$interval', '$timeout', 'admiralApiAdapter', 'popup_horn',
    dashboardNewCtrl
  ]);

  function dashboardNewCtrl($scope, $stateParams, $q, $state, $interval, $timeout,
    admiralApiAdapter, popup_horn) {
    /* jshint maxstatements:175 */
    var dashboardNewCtrlDefer = $q.defer();

    $scope._r.showCrumb = false;
    $scope.dashboardNewCtrlPromise = dashboardNewCtrlDefer.promise;
    var providerAuthNames = {
      bitbucketKeys: 'bitbucket',
      bitbucketServerKeys: 'bitbucketServer',
      githubKeys: 'github',
      githubEnterpriseKeys: 'ghe',
      gitlabKeys: 'gitlab'
    };
    var systemMachineImagesById;
    var runtimeTemplates;
    $scope.vm = {
      supportedOsTypes: [],
      isLoaded: false,
      resetSwitchForAmazonKeys: false,
      initializing: false,
      initialized: false,
      dbInitialized: false,
      upgrading: false,
      installing: false,
      saving: false,
      restartingServices: false,
      requireRestart: false,
      showNewSshKeyInt: false,
      sectionSelected: 'infrastructure',
      isEditingStateUrl: false,
      isEditingRabbitMqUrl: false,
      isEditingRedisUrl: false,
      disableRedisUrl: true,
      disableStateUrl: true,
      disableRabbitMqUrl: true,
      isEmailEnabled: false,
      isEmailMethodEnabled: false,
      isEditingUIUrl: false,
      isEditingAPIUrl: false,
      isEditingInternalAPIUrl: false,
      isEditingConsoleAPIUrl: false,
      isEditingMktgUrl: false,
      addNewWorker: false,
      isAuthInitialized: false,
      showServiceStatus: false,
      globalServices: [
        'api',
        'mktg',
        'www',
        'internalAPI',
        'consoleAPI'
      ],
      isNotValidurl: [],
      urlRegex: /(http(s)?:\/\/)?([a-zA-Z0-9]+([a-zA-Z0-9]+)+.*)$/,
      x86ArchCode: null,
      armArchCode: null,
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
      formValuesChanged: function (url, masterName) {
        validateSCMUrlWorkflow(url, masterName);
      },
      cancelStateUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingStateUrl = false;
          $('#checkbox_for_state_url').trigger('click');
        }, 0);
      },
      cancelRedisUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingRedisUrl = false;
          $('#checkbox_for_redis_url').trigger('click');
        }, 0);
      },
      cancelRabbitMqUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingRabbitMqUrl = false;
          $('#checkbox_for_msg_url').trigger('click');
        }, 0);
      },
      cancelUIUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingUIUrl = false;
          $('#checkbox_for_www_url').trigger('click');
        }, 0);
      },
      cancelMktgUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingMktgUrl = false;
          $('#checkbox_for_mktg_url').trigger('click');
        }, 0);
      },
      cancelAPIUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingAPIUrl = false;
          $('#checkbox_for_api_url').trigger('click');
        }, 0);
      },
      cancelInternalAPIUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingInternalAPIUrl = false;
          $('#checkbox_for_editing_internalApi_url').trigger('click');
        }, 0);
      },
      cancelConsoleAPIUpdate: function () {
        $timeout(function () {
          $scope.vm.isEditingConsoleAPIUrl = false;
          $('#checkbox_for_editing_consoleApi_url').trigger('click');
        }, 0);
      },
      cancelAddWorker: function () {
        $timeout(function () {
          $scope.vm.addNewWorker = false;
          $('#checkbox_for_adding_worker').trigger('click');
          $scope.vm.initializeForm.workers.confirmCommand = true;
        }, 0);
      },
      updateStateUrl: function (isSecure, updatedAddress) {
        $timeout(function () {
          var protocol = '';
          if (isSecure === true)
            protocol = 'https';
          else
            protocol = 'http';
          $scope.vm.installForm.state.gitlabCreds.data.url =
            protocol + '://' + updatedAddress;
          $scope.vm.installForm.consoleAPI.url.fqdn = updatedAddress;
          $scope.vm.isEditingStateUrl = false;
          $('#checkbox_for_state_url').trigger('click');
        }, 0);
      },
      updateRabbitMqUrl: function (isSecure, updatedAddress, updatedRootAdd,
        updatedAdminAdd) {
        $timeout(function () {
          var adminProtocol = '';
          var protocol = '';
          if (isSecure === true) {
            protocol = 'amqps';
            adminProtocol = 'https';
          } else {
            protocol = 'amqp';
            adminProtocol = 'http';
          }
          var amqpUrl = $scope.vm.installForm.msg.rabbitmqCreds.data.amqpUrl;
          $scope.vm.installForm.msg.rabbitmqCreds.data.amqpUrl =
            protocol + '://' + amqpUrl.split('://')[1].split('@')[0] + '@' +
            updatedAddress + '/' + amqpUrl.split('@')[1].split('/')[1];
          var amqpUrlRoot =
            $scope.vm.installForm.msg.rabbitmqCreds.data.amqpUrlRoot;
          $scope.vm.installForm.msg.rabbitmqCreds.data.amqpUrlRoot =
            protocol + '://' + amqpUrlRoot.split('://')[1].split('@')[0] + '@' +
            updatedRootAdd + '/' + amqpUrlRoot.split('@')[1].split('/')[1];
          var amqpUrlAdmin =
            $scope.vm.installForm.msg.rabbitmqCreds.data.amqpUrlAdmin;
          $scope.vm.installForm.msg.rabbitmqCreds.data.amqpUrlAdmin =
            adminProtocol + '://' + amqpUrlAdmin.split('://')[1].split('@')[0] +
            '@' + updatedAdminAdd;
          $scope.vm.isEditingRabbitMqUrl = false;
          $('#checkbox_for_msg_url').trigger('click');
        }, 0);
      },
      updateRedisUrl: function (updatedAddress) {
        $timeout(function () {
          $scope.vm.installForm.redis.url.data.url = updatedAddress;
          $scope.vm.installForm.redis.url.fqdn = updatedAddress;
          $scope.vm.isEditingRedisUrl = false;
          $('#checkbox_for_redis_url').trigger('click');
        }, 0);
      },
      saveServiceUrl: function (isSecure, updatedAddress, service) {
        $timeout(function () {
          var protocol = '';
          if (isSecure === true)
            protocol = 'https';
          else
            protocol = 'http';
          $scope.vm.installForm[service].url.data.url =
            protocol + '://' + updatedAddress;
          $scope.vm.installForm[service].url.fqdn = updatedAddress;
          if (service === 'www') {
            $scope.vm.isEditingUIUrl = false;
            $('#checkbox_for_www_url').trigger('click');
          }
          if (service === 'api') {
            $scope.vm.isEditingAPIUrl = false;
            $('#checkbox_for_api_url').trigger('click');
          }
          if (service === 'mktg') {
            $scope.vm.isEditingMktgUrl = false;
            $('#checkbox_for_mktg_url').trigger('click');
          }
          if (service === 'internalAPI') {
            $scope.vm.isEditingInternalAPIUrl = false;
            $('#checkbox_for_editing_internalApi_url').trigger('click');
          }
          if (service === 'consoleAPI') {
            $scope.vm.isEditingConsoleAPIUrl = false;
            $('#checkbox_for_editing_consoleApi_url').trigger('click');
          }
        }, 0);
      },
      checkEmailMethod: function (method) {
        if (method === 'gmail') {
          $scope.vm.installForm.notification.gmailCreds.isEnabled = true;
          $scope.vm.installForm.notification.mailgunCreds.isEnabled = false;
          $scope.vm.installForm.notification.smtpCreds.isEnabled = false;
        } else if (method === 'mailgun') {
          $scope.vm.installForm.notification.mailgunCreds.isEnabled = true;
          $scope.vm.installForm.notification.smtpCreds.isEnabled = false;
          $scope.vm.installForm.notification.gmailCreds.isEnabled = false;
        } else if (method === 'smtp') {
          $scope.vm.installForm.notification.smtpCreds.isEnabled = true;
          $scope.vm.installForm.notification.mailgunCreds.isEnabled = false;
          $scope.vm.installForm.notification.gmailCreds.isEnabled = false;
        }
      },
      // map by systemInt name, then masterName
      installForm: {
        ignoreTLSErrors: false,
        api: {
          url: {
            isEnabled: true,
            masterName: 'url',
            isSecure: '',
            localAddress: '',
            fqdn: '',
            data: {
              url: ''
            }
          }
        },
        internalAPI: {
          url: {
            isEnabled: false,
            masterName: 'url',
            isSecure: '',
            localAddress: '',
            fqdn: '',
            data: {
              url: ''
            }
          }
        },
        consoleAPI: {
          url: {
            isEnabled: false,
            masterName: 'url',
            isSecure: '',
            localAddress: '',
            fqdn: '',
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
            fqdn: '',
            isSecure: '',
            localAddress: '',
            fqdn: '',
            data: {
              url: ''
            }
          }
        },
        msg: {
          rabbitmqCreds: {
            isEnabled: true,
            masterName: 'rabbitmqCreds',
            isSecure: '',
            localAddress: '',
            localRootAddress: '',
            localAdminAddress: '',
            username: '',
            password: '',
            fqdn: '',
            rootFqdn: '',
            adminFqdn: '',
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
          },
          irc: {
            isEnabled: false
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
            localAddress: '',
            fqdn: '',
            data: {
              url: ''
            }
          }
        },
        state: {
          gitlabCreds: {
            isEnabled: true,
            isSecure: '',
            localAddress: '',
            fqdn: '',
            masterName: 'gitlabCreds',
            data: {
              password: '',
              url: '',
              username: ''
            }
          }
        },
        sshKeys: {},
        www: {
          url: {
            isEnabled: true,
            masterName: 'url',
            localAddress: '',
            fqdn: '',
            isSecure: '',
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
        artifactoryKey: {
          displayName: '',
          isEnabled: false
        },
        AWS: {
          displayName: '',
          isEnabled: false
        },
        amazonKeys: {
          displayName: '',
          isEnabled: false
        },
        AWS_IAM: {
          displayName: '',
          isEnabled: false
        },
        amazonIamRole: {
          displayName: '',
          isEnabled: false
        },
        AZURE_DCOS: {
          displayName: '',
          isEnabled: false
        },
        azureDcosKey: {
          displayName: '',
          isEnabled: false
        },
        azureKeys: {
          displayName: '',
          isEnabled: false
        },
        CLUSTER: {
          displayName: '',
          isEnabled: false
        },
        nodeCluster: {
          displayName: '',
          isEnabled: false
        },
        DCL: {
          displayName: '',
          isEnabled: false
        },
        dclKey: {
          displayName: '',
          isEnabled: false
        },
        DDC: {
          displayName: '',
          isEnabled: false
        },
        ddcKey: {
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
        gcloudKey: {
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
        hipchatKey: {
          displayName: '',
          isEnabled: false
        },
        irc: {
          displayName: '',
          isEnabled: false
        },
        KUBERNETES: {
          displayName: '',
          isEnabled: false
        },
        kubernetesConfig: {
          displayName: '',
          isEnabled: false
        },
        'pem-key': {
          displayName: '',
          isEnabled: false
        },
        pemKey: {
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
        quayLogin: {
          displayName: '',
          isEnabled: false
        },
        dockerRegistryLogin: {
          displayName: '',
          isEnabled: false
        },
        Slack: {
          displayName: '',
          isEnabled: false
        },
        slackKey: {
          displayName: '',
          isEnabled: false
        },
        jira: {
          displayName: '',
          isEnabled: false
        },
        email: {
          displayName: 'Email',
          isEnabled: false
        },
        TRIPUB: {
          displayName: '',
          isEnabled: false
        },
        joyentTritonKey: {
          displayName: '',
          isEnabled: false
        },
        webhook: {
          displayName: '',
          isEnabled: false
        },
        webhookV2: {
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
          intercom: {
            isEnabled: false,
            name: 'intercom',
            masterName: 'keyValuePair',
            data: {
              envs: {
                intercomAccessToken: ''
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
      changeSection: changeSection,
      copyText: 'Copy',
      copyToClipboard: copyToClipboard,
      resetInstallLocationModal: resetInstallLocationModal,
      showInstallLocationModal: showInstallLocationModal,
      saveInstallLocationModal: saveInstallLocationModal,
      secretsModalErrorMsg: null,
      msgModalErrorMsg: null,
      redisModalErrorMsg: null,
      stateModalErrorMsg: null,
      validatePassword: validatePassword,
      validateIP: validateIP,
      validateWorkerAddress: validateWorkerAddress,
      addWorker: addWorker,
      showAddNewWorker: showAddNewWorker,
      removeWorker: removeWorker,
      addSystemMachineImage: addSystemMachineImage,
      updateSMI: updateSMI,
      computeOs: computeOs,
      computeRuntimeTemplateId: computeRuntimeTemplateId,
      createSystemMachineImage: createSystemMachineImage,
      validSMI: validSMI,
      updateSystemMachineImage: updateSystemMachineImage,
      removeSystemMachineImage: removeSystemMachineImage,
      apply: apply,
      install: install,
      save: save,
      saveAndRestart: saveAndRestart,
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
      showRemoveSMIModal: showRemoveSMIModal,
      showSaveServicesModal: showSaveServicesModal,
      showRestartServicesModal: showRestartServicesModal,
      showApplyChangesModal: showApplyChangesModal,
      showSaveAndRestartModal: showSaveAndRestartModal,
      showEULAModal: showEULAModal,
      refreshLogs: refreshLogs,
      isGlobalService: isGlobalService,
      hasDefaultx86SystemMachineImage: hasDefaultx86SystemMachineImage,
      hasDefaultArmSystemMachineImage: hasDefaultArmSystemMachineImage,
      logOutOfAdmiral: logOutOfAdmiral,
      switchToggle: switchToggle,
      eulaText: '',
      runMode: 'production',
      allNodes: {}
    };

    var systemIntDataDefaults = {};

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};

      async.series([
          setBreadcrumb.bind(null, bag),
          getAdmiralEnv.bind(null, bag),
          getSystemSettings.bind(null, bag),
          getCoreServiceSettings.bind(null, bag),
          setupSystemIntDefaults.bind(null, bag),
          getSystemIntegrations.bind(null, bag),
          updateInitializeForm.bind(null, bag),
          getMachineKeys.bind(null, bag),
          getMasterIntegrations.bind(null, bag),
          getSystemSettingsForInstallPanel.bind(null, bag),
          getServices.bind(null, bag),
          getSystemMachineImages,
          getSystemCodes,
          getRuntimeTemplates,
          getSystemSettingsForAddonsPanel.bind(null, bag),
          updateAddonsFormSystemIntegrations,
          getSuperUsers
        ],
        function (err) {
          $scope.vm.isLoaded = true;
          if (err) {
            if ($scope.vm.shouldRedirect) {
              admiralApiAdapter.postLogout({},
                function (logoutErr) {
                  if (logoutErr)
                    return popup_horn.error(logoutErr);

                  $state.go('login2', $state.params);
                }
              );
            } else {
              dashboardNewCtrlDefer.reject(err);
              return popup_horn.error(err);
            }
          } else {
            if ($scope.vm.allNodes[$scope.vm.admiralEnv.ADMIRAL_IP])
              $scope.vm.allNodes[$scope.vm.admiralEnv.ADMIRAL_IP].push('admiral');
            else
              $scope.vm.allNodes[$scope.vm.admiralEnv.ADMIRAL_IP] = ['admiral'];
            dashboardNewCtrlDefer.resolve();
          }
        }
      );
    }

    function triggerSwitchery(id) {
      $timeout(function () {
        id = '#' + id;
        $(id).trigger('click');
      }, 0);
    }

    function setBreadcrumb(bag, next) {
      $scope._r.crumbList = [];

      var crumb = {
        name: 'DashboardNew'
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
            if (err.id === 2000) {
              $scope.vm.shouldRedirect = true;
              return next(err);
            }
            popup_horn.error(err);
            return next();
          }

          $scope.vm.admiralEnv = admiralEnv;
          if (admiralEnv && admiralEnv.IGNORE_TLS_ERRORS &&
            admiralEnv.IGNORE_TLS_ERRORS === 'true')
            $scope.vm.installForm.ignoreTLSErrors = true;
          return next();
        }
      );
    }

    function getCoreServiceSettings(bag, next) {
      if (!$scope.vm.systemSettings.db.isInitialized) return next();
      var coreServices =
        ['db', 'secrets', 'msg', 'state', 'redis', 'master'];
      async.each(coreServices,
        function (service, done) {
          admiralApiAdapter.getCoreService(service,
            function (err, configs) {
              if (err)
                return done(err);
              if (_.isEmpty(configs)) {
                // if empty, we can't do anything yet
                return done();
              }
              $scope.vm.systemSettings[service] =
                _.extend($scope.vm.systemSettings[service],
                  (configs));
              return done();
            }
          );
        },
        function (err) {
          return next(err);
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
            $scope.vm.systemSettings.master.isInitialized;
          if ($scope.vm.systemSettings.workers.length)
           $scope.vm.initialized = _.every($scope.vm.systemSettings.workers,
              function (worker) {
                return worker.isInitialized;
              }
            );

          if ($scope.vm.systemSettings.db && $scope.vm.systemSettings.db.address) {
            if ($scope.vm.allNodes[$scope.vm.systemSettings.db.address])
              $scope.vm.allNodes[$scope.vm.systemSettings.db.address].push('db');
            else
              $scope.vm.allNodes[$scope.vm.systemSettings.db.address] = ['db'];
          }
          if ($scope.vm.systemSettings.msg && $scope.vm.systemSettings.msg.address) {
            if ($scope.vm.allNodes[$scope.vm.systemSettings.msg.address])
              $scope.vm.allNodes[$scope.vm.systemSettings.msg.address].push('msg');
            else
              $scope.vm.allNodes[$scope.vm.systemSettings.msg.address] = ['msg'];
          }
          if ($scope.vm.systemSettings.state && $scope.vm.systemSettings.state.address) {
            if ($scope.vm.allNodes[$scope.vm.systemSettings.state.address])
              $scope.vm.allNodes[$scope.vm.systemSettings.state.address].push('state');
            else
              $scope.vm.allNodes[$scope.vm.systemSettings.state.address] = ['state'];
          }
          if ($scope.vm.systemSettings.secrets && $scope.vm.systemSettings.secrets.address) {
            if ($scope.vm.allNodes[$scope.vm.systemSettings.secrets.address])
              $scope.vm.allNodes[$scope.vm.systemSettings.secrets.address].push('secrets');
            else
              $scope.vm.allNodes[$scope.vm.systemSettings.secrets.address] = ['secrets'];
          }
          if ($scope.vm.systemSettings.redis && $scope.vm.systemSettings.redis.address) {
            if ($scope.vm.allNodes[$scope.vm.systemSettings.redis.address])
              $scope.vm.allNodes[$scope.vm.systemSettings.redis.address].push('redis');
            else
              $scope.vm.allNodes[$scope.vm.systemSettings.redis.address] = ['redis'];
          }
          if ($scope.vm.systemSettings.master && $scope.vm.systemSettings.master.address) {
            if ($scope.vm.allNodes[$scope.vm.systemSettings.master.address])
              $scope.vm.allNodes[$scope.vm.systemSettings.master.address].push('master');
            else
              $scope.vm.allNodes[$scope.vm.systemSettings.master.address] = ['master'];
          }
          _.each($scope.vm.systemSettings.workers,
            function(worker) {
              if (worker.address) {
                if ($scope.vm.allNodes[worker.address])
                  $scope.vm.allNodes[worker.address].push('worker');
                else
                  $scope.vm.allNodes[worker.address] = ['worker'];
              }
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
        sshKeys: {},
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
        intercom: {
          keyValuePair: {
            envs: {
              intercomAccessToken: ''
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
                if (masterName === 'irc') return;
                resetSystemIntegration(systemIntName, masterName);
              }
            );
          }
        }
      );

      admiralApiAdapter.getSystemIntegrations('',
        function (err, systemIntegrations) {
          if (err) {
            popup_horn.error(err);
            return next();
          }

          var sshKeyIntegration =
            _.findWhere(systemIntegrations, {name: 'sshKeys'});
          var sshKeyMasterName = 'sshKey';
          if (sshKeyIntegration)
            sshKeyMasterName = sshKeyIntegration.masterName;

          var sshKeysForm = {
            isEnabled: true,
            masterName: sshKeyMasterName,
            data: {
              publicKey: '',
              privateKey: ''
            }
          };
          var sshKeysDefault = {
            publicKey: '',
            privateKey: ''
          };
          //map the used masterName with sshKeys systemIntegration
          $scope.vm.installForm.sshKeys[sshKeyMasterName] = sshKeysForm;
          systemIntDataDefaults.sshKeys[sshKeyMasterName] = sshKeysDefault;
          if (sshKeyMasterName === 'ssh-key'){
            $scope.vm.addonsForm.sshKey = {
              displayName: '',
              isEnabled: false
            };
            $scope.vm.showNewSshKeyInt = true;
          }

          var apiIntegration =
            _.findWhere(systemIntegrations, {name: 'api'});

          var internalAPIIntegration =
            _.findWhere(systemIntegrations, {name: 'internalAPI'});

          // If internalAPIIntegration is not present copy
          //over the values of the default api to it
          if (!internalAPIIntegration && apiIntegration) {
            $scope.vm.installForm.internalAPI.url.data.url =
              apiIntegration.data.url;
            $scope.vm.installForm.internalAPI.url.fqdn =
              apiIntegration.data.url.split('://')[1];
            var protocol = apiIntegration.data.url.split('://')[0];
            $scope.vm.installForm.internalAPI.url.isSecure =
              protocol === 'https' ? true : false;
            $scope.vm.installForm.internalAPI.url.localAddress =
              concatWorkerAddress(protocol, '50000');
          }

          var consoleAPIIntegration =
            _.findWhere(systemIntegrations, {name: 'consoleAPI'});

          // If consoleAPIIntegration is not present copy
          //over the values of the default api to it
          if (!consoleAPIIntegration && apiIntegration) {
            $scope.vm.installForm.consoleAPI.url.data.url =
              apiIntegration.data.url;
            $scope.vm.installForm.consoleAPI.url.fqdn =
              apiIntegration.data.url.split('://')[1];
            var protocol = apiIntegration.data.url.split('://')[0];
            $scope.vm.installForm.consoleAPI.url.isSecure =
              protocol === 'https' ? true : false;
            $scope.vm.installForm.consoleAPI.url.localAddress =
              concatWorkerAddress(protocol, '50000');
          }

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
                if (sysIntName === 'notification' &&
                  $scope.vm.installForm[sysIntName][masterName].isEnabled) {
                  $scope.vm.isEmailEnabled = true;
                  $scope.vm.isEmailMethodEnabled = masterName;
                }
                if (sysIntName !== 'auth' &&
                  $scope.vm.installForm[sysIntName][masterName].data.url) {
                  var url = $scope.vm.installForm[sysIntName][masterName].data.url;
                  if (url.split('://').length === 1)
                    url = url.split('://')[0];
                  else
                    url = url.split('://')[1];
                  $scope.vm.installForm[sysIntName][masterName].fqdn = url;
                  $scope.vm.installForm[sysIntName][masterName].address =
                    url.split(':')[0].split('/')[0];
                  var protocol =
                    $scope.vm.installForm[sysIntName][masterName].data.url.split('://')[0];
                  if (protocol)
                    $scope.vm.installForm[sysIntName][masterName].isSecure =
                      protocol === 'https' ? true : false;
                  if (sysIntName === 'www') {
                    $scope.vm.installForm[sysIntName][masterName].localAddress =
                      concatWorkerAddress(protocol, '50001');
                  }
                  if (sysIntName === 'mktg') {
                    $scope.vm.installForm[sysIntName][masterName].localAddress =
                      concatWorkerAddress(protocol, '50002');
                  }
                  if (sysIntName === 'api' || sysIntName === 'internalAPI'
                    || sysIntName === 'consoleAPI') {
                    $scope.vm.installForm[sysIntName][masterName].localAddress =
                      concatWorkerAddress(protocol, '50000');
                  }
                  if (sysIntName === 'redis') {
                    $scope.vm.installForm[sysIntName][masterName].localAddress =
                      $scope.vm.systemSettings.redis.address + ':' +
                      $scope.vm.systemSettings.redis.port;
                  }
                  if (sysIntName === 'state') {
                    var path =
                      $scope.vm.installForm[sysIntName][masterName].data.url.split('/api')[1];
                    $scope.vm.installForm[sysIntName][masterName].localAddress =
                      protocol + '://' + $scope.vm.systemSettings.state.address + '/api' + path;
                  }
                }
                if (sysIntName === 'msg') {
                  var defaultAddress = $scope.vm.systemSettings.msg.address;
                  var amqpUrl = $scope.vm.installForm[sysIntName][masterName].data.amqpUrl;
                  var amqpUrlRoot = $scope.vm.installForm[sysIntName][masterName].data.amqpUrlRoot;
                  var amqpUrlAdmin = $scope.vm.installForm[sysIntName][masterName].data.amqpUrlAdmin;
                  var auth =  $scope.vm.installForm[sysIntName][masterName].data.amqpUrlRoot.
                    split('@')[0].split('//')[1];
                  $scope.vm.installForm[sysIntName][masterName].fqdn =
                    amqpUrl.split('@')[1].split('/')[0];
                  $scope.vm.installForm[sysIntName][masterName].rootFqdn =
                    amqpUrlRoot.split('@')[1].split('/')[0];
                  $scope.vm.installForm[sysIntName][masterName].adminFqdn =
                    amqpUrlAdmin.split('@')[1].split('/')[0];
                  $scope.vm.installForm[sysIntName][masterName].username =
                    auth.split(':')[0];
                  $scope.vm.installForm[sysIntName][masterName].password =
                    auth.split(':')[1];
                  $scope.vm.installForm[sysIntName][masterName].localAddress =
                    amqpUrl.split('@')[0] + '@' + defaultAddress + ':' +
                    $scope.vm.systemSettings.msg.amqpPort + '/' +
                    amqpUrl.split('@')[1].split('/')[1];
                  $scope.vm.installForm[sysIntName][masterName].localRootAddress =
                    amqpUrlRoot.split('@')[0] + '@' + defaultAddress + ':' +
                    $scope.vm.systemSettings.msg.amqpPort + '/' +
                    amqpUrlRoot.split('@')[1].split('/')[1];
                  $scope.vm.installForm[sysIntName][masterName].localAdminAddress =
                    amqpUrlAdmin.split('@')[0] + '@' + defaultAddress + ':' +
                    $scope.vm.systemSettings.msg.adminPort;
                  $scope.vm.installForm[sysIntName][masterName].isSecure =
                    amqpUrl.split('://')[0] === 'amqps' ? true : false;
                }
                if (sysIntName === 'auth') {
                  var providerAuthName = providerAuthNames[masterName];
                  if (!_.isEmpty(providerAuthName)) {
                    $scope.vm.installForm[sysIntName][masterName].callbackUrl =
                      systemIntegration.data.wwwUrl + '/auth/' +
                      providerAuthName + '/' + systemIntegration.id +
                      '/identify';
                  }
                  $scope.vm.isAuthInitialized = true;
                }
              }
            }
          );
          return next();
        }
      );
    }

    function concatWorkerAddress(protocol, port) {
      var masterAddress = protocol + '://' + $scope.vm.systemSettings.master.address + ':' + port;
      var workerAddress = '';
      _.each($scope.vm.systemSettings.workers,
        function (worker) {
          var address = protocol + '://' + worker.address + ':' + port;
          workerAddress = workerAddress.concat(', ' + address);
        }
      );
      masterAddress = masterAddress.concat(workerAddress);
      return masterAddress;
    }

    function validateSCMUrlWorkflow(url, masterName) {
       var bag = {
         url: url,
         name: 'auth',
         masterName: masterName,
         isNotValidurl: []
       };
       async.series([
         getSystemIntegration.bind(null, bag),
         validateSCMUrl.bind(null, bag)
       ],
         function () {
          $scope.vm.isNotValidurl[bag.masterName] =
            bag.isNotValidurl[bag.masterName];
          $scope.vm.disableSave = bag.isNotValidurl[bag.masterName];
         }
       );
     }

     function validateSCMUrl(bag, next) {
       var validateBody = {
         url: bag.url
       };
       admiralApiAdapter.validateUrl(bag.systemIntegration.id, validateBody,
         function (err, res) {
           if (err) {
             bag.isNotValidurl[bag.masterName] = true;
             return next();
           }
           bag.isNotValidurl[bag.masterName] = false;
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
                if ($scope.vm.systemSettings[service] &&
                  $scope.vm.systemSettings[service][key])
                  $scope.vm.initializeForm[service][key] =
                    $scope.vm.systemSettings[service][key];
              }
            );

          // don't update these input field's models if in postServices flow as these models
          // can have new values modified by user which will be refreshed from systemIntegrations
          // only in postInitFlow that happens after initialize is completed.
          // so don't try to overwrite user modified values until initFlow is completed
          if (!bag.inPostServices) {
            if (service === 'secrets') {
              $scope.vm.initializeForm[service].rootToken =
                $scope.vm.admiralEnv.VAULT_TOKEN || '';
            } else if (service === 'msg') {
              var msgSystemIntegration =
                _.findWhere($scope.vm.systemIntegrations,
                  {name: 'msg', masterName: 'rabbitmqCreds'});
              if (msgSystemIntegration) {
                var auth = msgSystemIntegration.data.amqpUrlRoot.
                  split('@')[0].split('//')[1];
                $scope.vm.initializeForm[service].username = auth.split(':')[0];
                $scope.vm.initializeForm[service].password = auth.split(':')[1];
              } else {
                if (_.isEmpty($scope.vm.initializeForm[service].password))
                  $scope.vm.initializeForm[service].password =
                    $scope.vm.admiralEnv.DB_PASSWORD;
              }
            } else if (service === 'state') {
              var stateSystemIntegration =
                _.findWhere($scope.vm.systemIntegrations,
                  {name: 'state', masterName: 'gitlabCreds'});
              if (stateSystemIntegration) {
                $scope.vm.initializeForm[service].rootPassword =
                  stateSystemIntegration.data.password;
              } else {
                if (_.isEmpty($scope.vm.initializeForm[service].rootPassword))
                  $scope.vm.initializeForm[service].rootPassword =
                    $scope.vm.admiralEnv.DB_PASSWORD;
              }
            }
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
          if ($scope.vm.systemSettings[service] &&
            $scope.vm.systemSettings[service].isInitialized)
            $scope.vm.initializeForm[service].confirmCommand = true;
        }
      );

      return next();
    }

    //ngclipboard has issues working with the modal. So using Clipboard instead.
    function copyToClipboard() {
      var clipboard = new Clipboard('#copy');
      $scope.vm.copyText = 'Copied';
    }

    function resetInstallLocationModal (fromCopy) {
      var old =  fromCopy + '_old';
      $scope.vm.initializeForm[fromCopy] =  angular.copy($scope.vm.initializeForm[old]);
      $scope.vm.copyText = 'Copy';
    }

    function saveInstallLocationModal (secName) {
      if (secName === 'secrets') {
        var hasErr = '';

        if ($scope.vm.initializeForm.secrets.initType === 'new') {
          hasErr = validateIP ($scope.vm.initializeForm.secrets.address);
          if (!$scope.vm.initializeForm.secrets.confirmCommand) {
            hasErr = 'has-error';
          }
        }
        if ($scope.vm.initializeForm.secrets.initType === 'existing') {
          hasErr = validateIP ($scope.vm.initializeForm.secrets.address);
          if (!$scope.vm.initializeForm.secrets.rootToken.length) {
            hasErr = 'has-error';
          }
        }

        if (hasErr) {
          $scope.vm.secretsModalErrorMsg = hasErr;
        } else {
          $scope.vm.secretsModalErrorMsg = '';
          $('#secrets-location-modal').modal('hide');
        }
      }
      if (secName === 'msg') {
        var hasErr = '';

        if ($scope.vm.initializeForm.msg.initType === 'new') {
          hasErr = validateIP ($scope.vm.initializeForm.msg.address);
          if (!$scope.vm.initializeForm.msg.confirmCommand) {
            hasErr = 'has-error';
          }
        }
        if ($scope.vm.initializeForm.msg.initType === 'new') {
          hasErr = validatePassword ($scope.vm.initializeForm.msg.password);
          if (!$scope.vm.initializeForm.msg.confirmCommand) {
            hasErr = 'has-error';
          }
        }
        if ($scope.vm.initializeForm.msg.initType === 'existing') {
          hasErr = validateIP ($scope.vm.initializeForm.msg.address);
          if (!$scope.vm.initializeForm.msg.username.length) {
            hasErr = 'has-error';
          }
        }

        if (hasErr) {
          $scope.vm.msgModalErrorMsg = hasErr;
        } else {
          $scope.vm.msgModalErrorMsg = '';
          $('#msg-location-modal').modal('hide');
        }
      }

      if (secName === 'redis') {
        var hasErr = '';

        if ($scope.vm.initializeForm.redis.initType === 'new') {
          hasErr = validateIP ($scope.vm.initializeForm.redis.address);
          if (!$scope.vm.initializeForm.redis.confirmCommand) {
            hasErr = 'has-error';
          }
        }
        if ($scope.vm.initializeForm.redis.initType === 'existing') {
          hasErr = validateIP ($scope.vm.initializeForm.redis.address);
        }

        if (hasErr) {
          $scope.vm.redisModalErrorMsg = hasErr;
        } else {
          $scope.vm.redisModalErrorMsg = '';
          $('#redis-location-modal').modal('hide');
        }
      }

      if (secName === 'state') {
        var hasErr = '';

        if ($scope.vm.initializeForm.state.initType === 'new') {
          // if both the address and the rootPassword are empty then error
          if (!$scope.vm.initializeForm.state.address ||
            !$scope.vm.initializeForm.state.rootPassword)
            hasErr = 'has-error';
          // else validate both the address and rootPassword
          hasErr = hasErr ||
            (validateIP($scope.vm.initializeForm.state.address) ||
            validatePassword($scope.vm.initializeForm.state.rootPassword));
          // if ssh command not run on the node
          if (!$scope.vm.initializeForm.state.confirmCommand) {
            hasErr = 'has-error';
          }
        }

        if ($scope.vm.initializeForm.state.initType === 'existing') {
          // if both the address and the rootPassword are empty then error
          if (!$scope.vm.initializeForm.state.address ||
            !$scope.vm.initializeForm.state.rootPassword)
            hasErr = 'has-error';
          // else validate both the address and rootPassword
          hasErr = hasErr ||
            (validateIP($scope.vm.initializeForm.state.address) ||
            validatePassword($scope.vm.initializeForm.state.rootPassword));
        }

        if (hasErr) {
          $scope.vm.stateModalErrorMsg = hasErr;
        } else {
          $scope.vm.stateModalErrorMsg = '';
          $('#state-location-modal').modal('hide');
        }
      }
    }

    function showInstallLocationModal(sectionName, clickType) {
      var old = sectionName + '_old';
      $scope.vm.copyText = 'Copy';

      if (sectionName === 'secrets') {
        $scope.vm.secretsModalErrorMsg = '';
        $scope.vm.initializeForm[old] =  angular.copy($scope.vm.initializeForm.secrets);
        if (clickType === 'dropdown' && $scope.vm.initializeForm.secrets.initType === 'admiral') {
          //do nothing
        } else {
          $('#secrets-location-modal').modal('show');
        }
      }

      if (sectionName === 'msg') {
        $scope.vm.msgModalErrorMsg = '';
        $scope.vm.initializeForm[old] =  angular.copy($scope.vm.initializeForm.msg);
        if (clickType === 'dropdown' && $scope.vm.initializeForm.msg.initType === 'admiral') {
          //do nothing
        } else {
          $('#msg-location-modal').modal('show');
        }
      }

      if (sectionName === 'state') {
        $scope.vm.stateModalErrorMsg = '';
        $scope.vm.initializeForm[old] = angular.copy(
          $scope.vm.initializeForm.state);
        if (clickType === 'dropdown' &&
          $scope.vm.initializeForm.state.initType === 'admiral') {
          //do nothing
        } else {
          $('#state-location-modal').modal('show');
        }
      }

      if (sectionName === 'redis') {
        $scope.vm.initializeForm[old] = angular.copy(
          $scope.vm.initializeForm.redis);
        if (clickType === 'dropdown' &&
          $scope.vm.initializeForm.redis.initType === 'admiral') {
          //do nothing
        } else {
          $('#redis-location-modal').modal('show');
        }
      }
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
            popup_horn.error(err);
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
            popup_horn.error(err);
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
                $scope.vm.addonsForm[masterInt.name].isDeprecated =
                  masterInt.isDeprecated;
              }
            }
          );

          return next();
        }
      );
    }

    function getSystemCodes(next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemCodes('',
        function (err, systemCodes) {
          if (err) {
            popup_horn.error(err);
            return next();
          }

          if (_.isEmpty(systemCodes))
            return next();

          $scope.vm.archTypes = _.filter(systemCodes, {group: 'archType'});
          $scope.vm.osTypes = _.filter(systemCodes, {group: 'osType'});
          $scope.vm.archTypesByCode = _.groupBy($scope.vm.archTypes, 'code');
          $scope.vm.clusterTypes = _.filter(systemCodes, {group:'clusterType'});
          $scope.vm.x86ArchCode = _.findWhere($scope.vm.archTypes,
            {name: 'x86_64'}).code;
          $scope.vm.armArchCode = _.findWhere($scope.vm.archTypes,
            {name: 'aarch64'}).code;
          return next();
        }
      );
    }

    function getSystemSettingsForInstallPanel(bag, next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemSettings(
        function (err, systemSettings) {
          if (err) {
            popup_horn.error(err);
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
            'defaultMinionInstanceSize',
            'defaultClusterType'
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
            popup_horn.error(err);
            return next();
          }

          $scope.vm.allServices = services;
          if (!$scope.vm.installing && !$scope.vm.saving) {
            // Don't change this while installing
            $scope.vm.requireRestart = _.some($scope.vm.allServices,
              function (service) {
                return service.isEnabled;
              }
            );

            $scope.vm.installForm.notification.irc.isEnabled = _.some(
              $scope.vm.allServices,
              function (service) {
                return service.serviceName === 'irc' && service.isEnabled;
              }
            );
          }

          var enabledServices = _.filter($scope.vm.allServices,
            function(svc){
              return svc.isEnabled === true;
            }
          );
          if (!_.isEmpty(enabledServices))
            $scope.vm.showServiceStatus = true;

          return next();
        }
      );
    }

    function getSystemMachineImages(next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemMachineImages('',
        function (err, systemMachineImages) {
          if (err) {
            popup_horn.error(err);
            return next();
          }

          if (_.isEmpty(systemMachineImages)) {
            popup_horn.error('No default system machine image found. ' +
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
          systemMachineImagesById =
            _.groupBy($scope.vm.installForm.systemMachineImages, 'id');
          return next();
        }
      );
    }

    function getRuntimeTemplates(next) {
      if (!$scope.vm.initialized) return next();
      admiralApiAdapter.getRuntimeTemplates(
        function (err, runtimeTemps) {
          if (err) {
            popup_horn.error(err);
            return next();
          }

          runtimeTemplates = runtimeTemps;
          return next();
        }
      );
    }

    function getSystemSettingsForAddonsPanel(bag, next) {
      if (!$scope.vm.initialized) return next();

      admiralApiAdapter.getSystemSettings(
        function (err, systemSettings) {
          if (err) {
            popup_horn.error(err);
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

    function changeSection(section) {
      $scope.vm.sectionSelected = section;
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

    function apply() {
      $('#applyModal').modal('hide');
      async.series([
          initialize,
          install,
          save,
          restartServices,
          postInitFlow
        ],
        function (err) {
          if (err)
            return popup_horn.error(err);
          popup_horn.success('Successfully applied changes');
        }
      );
    }

    function initialize(next) {
      $scope.vm.initializing = true;
      async.series([
          validateUserInput,
          saveInstallerKeys,
          postDBInitialize,
          postAndInitSecrets,
          postServices,
          initMsg,
          initState,
          initRedis,
          initMaster,
          initWorkers
        ],
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            return next(err);
          }

          return next();
        }
      );
    }

    function validateUserInput (next) {
      if ($scope.vm.isInitialized) return next();
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
      if ($scope.vm.isInitialized) return next();
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

          pollService('db', next);
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
              return popup_horn.error(err);
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

    function postAndInitSecrets(next) {
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
            return next(err);
          }

          pollService('secrets', next);
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

    function postServices(next) {
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
      var workersList = $scope.vm.initializeForm.workers.workers;
      var deletedWorkers = $scope.vm.initializeForm.workers.deletedWorkers;

      if ($scope.vm.initializeForm.msg.initType === 'new')
        msgUpdate.address = $scope.vm.initializeForm.msg.address;

      if ($scope.vm.initializeForm.state.initType === 'new') {
        stateUpdate.address = $scope.vm.initializeForm.state.address;
        stateUpdate.sshPort = 22;
      }

      if ($scope.vm.initializeForm.redis.initType === 'new')
        redisUpdate.address = $scope.vm.initializeForm.redis.address;

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
      stateUpdate.sshPort = $scope.vm.initializeForm.state.sshPort ||
        ($scope.vm.admiralEnv.DEV_MODE ? 2222 : 22);

      var updateInitializeFormBag = {
        inPostServices: true
      };
      async.series([
          postMsg.bind(null, msgUpdate),
          postState.bind(null, stateUpdate),
          postRedis.bind(null, redisUpdate),
          postMaster.bind(null, masterUpdate),
          postWorkers.bind(null, workersList),
          deleteWorkers.bind(null, deletedWorkers),
          getSystemSettings.bind(null, {}),
          updateInitializeForm.bind(null, updateInitializeFormBag),
          updateInstallForm.bind(null, workersList)
        ],
        function (err) {
          if (err) {
            $scope.vm.initializing = false;
            return next(err);
          }

          return next();
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

    function initMsg(next) {
      $scope.vm.systemSettings.msg.isProcessing = true;

      admiralApiAdapter.initMsg({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.msg.isProcessing = false;
            $scope.vm.initializing = false;
            return next(err);
          }

          pollService('msg', next);
        }
      );
    }

    function initState(next) {
      $scope.vm.systemSettings.state.isProcessing = true;

      admiralApiAdapter.initState({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.state.isProcessing = false;
            $scope.vm.initializing = false;
            return next(err);
          }
          pollService('state', next);
        }
      );
    }

    function initRedis(next) {
      $scope.vm.systemSettings.redis.isProcessing = true;
      admiralApiAdapter.initRedis({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.redis.isProcessing = false;
            $scope.vm.initializing = false;
            return next(err);
          }
          pollService('redis', next);
        }
      );
    }

    function initMaster(next) {
      $scope.vm.systemSettings.master.isProcessing = true;
      admiralApiAdapter.initMaster({},
        function (err) {
          if (err) {
            $scope.vm.systemSettings.master.isProcessing = false;
            $scope.vm.initializing = false;
            return next(err);
          }
          pollService('master', next);
        }
      );
    }

    function initWorkers(next) {
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
            return next(err);
          }
          return next();
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

    function postInitFlow(next) {
      async.parallel([
          getSystemIntegrations.bind(null, {}),
          getSystemSettingsForInstallPanel.bind(null, {}),
          getServices.bind(null, {}),
          getSystemMachineImages,
          getSystemCodes,
          getMasterIntegrations.bind(null, {}),
          updateInitializeForm.bind(null, {}),
          updateAddonsFormSystemIntegrations,
        ],
        function (err) {
          if (err)
            return next(err);

          $scope.vm.initializing = false;
          return next();
        }
      );
    }

    function showAddNewWorker() {
      $scope.vm.initializeForm.workers.confirmCommand = false;
    }

    function addWorker(worker) {
      $timeout(function () {
        if (!worker.name.length) {
          popup_horn.error('A swarm worker should have a valid name');
          return;
        }

        if (validateIP(worker.address) === 'has-error') {
          popup_horn.error('A swarm worker should have a valid IP address');
          return;
        }

        if (worker.address === $scope.vm.admiralEnv.ADMIRAL_IP) {
          popup_horn.error('The swarm worker cannot have the same IP as the ' +
            'swarm master');
          return;
        }

        var nameInUse = _.some($scope.vm.initializeForm.workers.workers,
          function (existingWorker) {
            return existingWorker.name === worker.name;
          }
        );

        if (nameInUse) {
          popup_horn.error('A swarm worker already exists with that name. ' +
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
          popup_horn.error('A swarm worker already exists with that address. ' +
            'Worker addresses must be unique.'
          );
          return;
        }

        $scope.vm.initializeForm.workers.workers.push(worker);
        $scope.vm.initializeForm.workers.newWorker = {
          name: '',
          address: ''
        };
        $scope.vm.addNewWorker = false;
        $('#checkbox_for_adding_worker').trigger('click');
        $scope.vm.initializeForm.workers.confirmCommand = true;
      }, 0);
    }

    function removeWorker (worker) {
      if (worker.isInitialized || worker.isFailed)
        $scope.vm.initializeForm.workers.deletedWorkers.push(worker);
      $scope.vm.initializeForm.workers.workers =
        _.without($scope.vm.initializeForm.workers.workers,
          _.findWhere($scope.vm.initializeForm.workers.workers,
            {name: worker.name})
        );

      if (!worker.isInitialized)
        $scope.vm.systemSettings.workers =
          _.without($scope.vm.systemSettings.workers,
            _.findWhere($scope.vm.systemSettings.workers,
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
        sshPort: 22,
        runtimeTemplateId: null,
      };

      $scope.vm.selectedSMI = newSystemMachineImage;
      $('#smi-edit-modal').modal('show');
    }

    function updateSMI(image) {
      $scope.vm.selectedSMI =_.clone(
        _.first(systemMachineImagesById[image.id]));
      if (image.runtimeTemplateId)
        $scope.vm.selectedSMI.osTypeCode = _.findWhere(
          runtimeTemplates, {id: image.runtimeTemplateId}).osTypeCode;
      computeOs();
      $('#smi-edit-modal').modal('show');
    }

    function computeOs() {
      var supportedOsTypes = [];
      var supportedOsCodes = _.unique(_.pluck(_.where(
        runtimeTemplates,
        {
          archTypeCode: $scope.vm.selectedSMI.archTypeCode
        }
      ), 'osTypeCode'));
      _.each(supportedOsCodes,
        function(osCode) {
          supportedOsTypes.push(_.findWhere($scope.vm.osTypes, {code: osCode}));
        }
      );
      $scope.vm.supportedOsTypes = supportedOsTypes;
      computeRuntimeTemplateId();
    }

    function computeRuntimeTemplateId() {
      $scope.vm.supportedRuntimeTemplates = _.where(
        runtimeTemplates,
        {
          osTypeCode: $scope.vm.selectedSMI.osTypeCode,
          archTypeCode: $scope.vm.selectedSMI.archTypeCode
        }
      );
    }

    function validSMI(newImage) {
      var valid = true;
      valid = valid && !!newImage.name;
      valid = valid && !!newImage.description;
      valid = valid && !!newImage.externalId;
      valid = valid && !!newImage.region;
      valid = valid && !!newImage.keyName;
      valid = valid && !!newImage.runShImage;
      valid = valid && !!newImage.securityGroup;
      valid = valid && !!newImage.drydockTag;
      valid = valid && !!newImage.drydockFamily;
      valid = valid && !!newImage.archTypeCode;
      return valid;
    }

    function createSystemMachineImage(newImage) {
      var body = _.clone(newImage);
      if (body.subnetId === '')
        body.subnetId = null;

      var bag = {
        body: body,
        accessKey: $scope.vm.installForm.provision.amazonKeys.data.accessKey,
        secretKey: $scope.vm.installForm.provision.amazonKeys.data.secretKey,
        region: body.region,
        amiId: body.externalId,
        systemMachineImageName: body.name
      };
      async.series([
          __getImageByAmiId.bind(null, bag),
          __postSystemMachineImage.bind(null, bag)
        ],
        function (err) {
          if (err)
            popup_horn.error(err);
          else {
            $scope.vm.installForm.systemMachineImages.push(newImage);
            systemMachineImagesById =
              _.groupBy($scope.vm.installForm.systemMachineImages, 'id');
          }

          $('#smi-edit-modal').modal('hide');
        }
      );
    }

    function removeSystemMachineImage(deletedImage) {
      $('#remove-smi-modal').modal('hide');
      admiralApiAdapter.deleteSystemMachineImage(deletedImage.id,
        function (err) {
          if (err) {
            popup_horn.error(err);
          } else {
            $scope.vm.installForm.systemMachineImages =
              _.without($scope.vm.installForm.systemMachineImages, deletedImage);
            systemMachineImagesById =
              _.groupBy($scope.vm.installForm.systemMachineImages, 'id');
          }
        }
      );
    }

    function updateSystemMachineImage(updatedImage) {
      var body = _.clone(updatedImage);
      if (body.subnetId === '')
        body.subnetId = null;

      var bag = {
        id: updatedImage.id,
        body: body,
        accessKey: $scope.vm.installForm.provision.amazonKeys.data.accessKey,
        secretKey: $scope.vm.installForm.provision.amazonKeys.data.secretKey,
        region: body.region,
        amiId: body.externalId,
        systemMachineImageName: body.name
      };
      async.series([
          __getImageByAmiId.bind(null, bag),
          __putSystemMachineImage.bind(null, bag)
        ],
        function (err) {
          if (err)
            popup_horn.error(err);
          else {
            _.extend(_.findWhere($scope.vm.installForm.systemMachineImages,
              { id: updatedImage.id }), updatedImage);
            systemMachineImagesById =
              _.groupBy($scope.vm.installForm.systemMachineImages, 'id');
          }

          $('#smi-edit-modal').modal('hide');
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

    function deleteIrcService(bag, next) {
      var body = {
        isEnabled: $scope.vm.installForm.notification.irc.isEnabled
      };
      admiralApiAdapter.deleteService('irc', body,
        function (err) {
          if (err)
            return next(err);
          return next();
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

    function install(next) {
      if (!next)
        next = '';

      if (!$scope.vm.initialized) return next();
      if ($scope.vm.requireRestart) return next();
      $scope.vm.installing = true;

      async.series([
          postInitFlow,
          validateInstallForm,
          updateSSHKeysSystemIntegration,
          updateAPISystemIntegration,
          updateInternalAPISystemIntegration,
          updateConsoleAPISystemIntegration,
          updateIgnoreTLSEnv,
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
          updateInstallPanelSystemSettings,
          getMasterIntegrations.bind(null, {}),
          updateProvisionSystemIntegration,
          getSystemMachineImages,
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
          startOrStopIrc,
          startCharon,
          startDeploy,
          startManifest,
          startRelease,
          startRSync,
          startTimeTrigger,
          startVersionTrigger,
          startCron,
          startNexec,
          getServices.bind(null, {}),
          getSuperUsers
        ],
        function (err) {
          $scope.vm.installing = false;
          if (err) {
            if (next)
              return next(err);
            popup_horn.error(err);
          }

          if (next)
            return next();
        }
      );
    }

    function saveAndRestart() {
      $('#save-restart-modal').modal('hide')
      async.series([
          save,
          restartServices
        ],
        function (err) {
          if (err)
            return popup_horn.error(err);
          popup_horn.success('Successfully Restarted');
        }
      );
    }

    function save(next) {
      if (!next)
        next = '';
      if (!$scope.vm.requireRestart) return next();
      $scope.vm.saving = true;
      hideSaveModal();

      async.series([
          validateInstallForm,
          updateSSHKeysSystemIntegration,
          updateAPISystemIntegration,
          updateInternalAPISystemIntegration,
          updateConsoleAPISystemIntegration,
          updateIgnoreTLSEnv,
          updateWWWSystemIntegration,
          updateAuthSystemIntegrations,
          enableSCMMasterIntegrations,
          updateMktgSystemIntegration,
          updateMsgSystemIntegration,
          updateRedisSystemIntegration,
          updateStateSystemIntegration,
          updateInstallPanelSystemSettings,
          getMasterIntegrations.bind(null, {}),
          updateProvisionSystemIntegration,
          getSystemMachineImages,
          updateFilestoreSystemIntegration,
          updateInternalAPIService,
          updateConsoleAPIService,
          saveServices,
          getServices.bind(null, {}),
          getSuperUsers
        ],
        function (err) {
          $scope.vm.saving = false;
          if (err) {
            if (next)
              return next(err);
            popup_horn.error(err);
          }

          if (next)
            return next();
        }
      );
    }

    function restartServices(next) {
      if (!next)
        next = '';
      if (!$scope.vm.requireRestart) return next();
      $scope.vm.restartingServices = true;
      hideRestartServicesModal();

      var bag = {};
      async.series([
          getEnabledServices.bind(null, bag),
          deleteAddonServices.bind(null, bag),
          deleteIrcService.bind(null, bag),
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
          if (err) {
            if (next)
              return next(err);
            popup_horn.error(err);
          }

          // Check if we should show "Install" or "Save" and "Restart Services"
          getServices({},
            function (err) {
              if (err)
                return next(err);
            }
          );
          if (next)
            return next();
        }
      );
    }

    function saveServices(next) {
      $scope.vm.saving = true;
      hideSaveServicesModal();

      var enabledServices = _.filter($scope.vm.allServices,
        function(svc){
          return svc.isEnabled === true;
        }
      );

      async.eachSeries(enabledServices,
        function (service, done) {
          admiralApiAdapter.putService(service.serviceName, service,
            function (err) {
              if (err)
                popup_horn.error(err);
              return done();
            }
          );
        },
        function (err) {
          $scope.vm.saving = false;
          if (err)
            popup_horn.error(err);
          return next();
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
            popup_horn.error(err);
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
            popup_horn.error(err);
          return next();
        }
      );
    }

    function updateIrcService(next) {
      var ircService = {};
      _.each($scope.vm.allServices,
        function (service) {
          if (service.serviceName === 'irc')
            ircService = service;
        }
      );

      ircService.isEnabled = $scope.vm.installForm.notification.irc.isEnabled;

      admiralApiAdapter.putService('irc', ircService,
        function (err) {
          if (err)
            popup_horn.error(err);
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

      var sshKeyMasterName = 'sshKey';
      var sshKeyIntegration =
        _.findWhere($scope.vm.systemIntegrations, {name: 'sshKeys'});

      if (sshKeyIntegration)
        sshKeyMasterName = sshKeyIntegration.masterName;
      var bag = {
        name: 'sshKeys',
        masterName: $scope.vm.installForm.sshKeys[sshKeyMasterName].masterName,
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

    function updateIgnoreTLSEnv(next) {
      var ignoreTLSErrors = 'false';
      if ($scope.vm.installForm.ignoreTLSErrors)
        ignoreTLSErrors = 'true';

      var innerBag = {
        envVars: null,
        ignoreTLSErrors: ignoreTLSErrors
      };

      async.series(
        [
          _getAdmiralEnv.bind(null, innerBag),
          _setIgnoreTlsEnv.bind(null, innerBag)
        ],
        function (err) {
          return next(err);
        }
      );
    }

    function _getAdmiralEnv(innerBag, nextStep) {
      admiralApiAdapter.getAdmiralEnv(
        function (err, admiralEnv) {
          if (err)
            return nextStep(err);
          innerBag.envVars = admiralEnv;
          return nextStep();
        }
      );
    }

    function _setIgnoreTlsEnv(innerBag, nextStep) {
      if (!innerBag.envVars)
        return nextStep(1);

      if (innerBag.envVars.IGNORE_TLS_ERRORS) {
        admiralApiAdapter.putAdmiralEnv(
          {
            IGNORE_TLS_ERRORS: innerBag.ignoreTLSErrors
          },
          function (err) {
            if (err)
              return nextStep(err);
            return nextStep();
          }
        );
      } else {
        admiralApiAdapter.postAdmiralEnv(
          {
            IGNORE_TLS_ERRORS: innerBag.ignoreTLSErrors
          },
          function (err) {
            if (err)
              return nextStep(err);
            return nextStep();
          }
        );
      }
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

      updatedSystemMachineImages = _.sortBy(updatedSystemMachineImages,
        function (smi) {
          return smi.isDefault;
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
            amiId: body.externalId,
            systemMachineImageName: body.name
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
            amiId: body.externalId,
            systemMachineImageName: body.name
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
      if (bag.body.archTypeCode === $scope.vm.armArchCode) return next();

      var query = 'region=' + bag.region;
      admiralApiAdapter.getImageByAmiId(bag.amiId, query,
        function (err, imageId) {
          if (err)
            return next(err);

          if (_.isEmpty(imageId))
            return next('Error: Entered ami-id is not correct for system ' +
              'machine image: ' + bag.systemMachineImageName);

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

    function startOrStopIrc(next) {
      if ($scope.vm.installForm.notification.irc.isEnabled ||
        $scope.vm.addonsForm.irc.isEnabled)
        startService('irc',
          function (err) {
            if (err)
              return next(err);
            return next();
          }
        );
      else
        admiralApiAdapter.deleteService('irc', {},
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
            return popup_horn.error(err);

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
            return popup_horn.error(err);

          $scope.vm.selectedService.configs = [];

          var validKeys = ['isInitialized', 'isInstalled',
            'isShippableManaged', 'isSecure'];
          _.each(configs,
            function (value, key) {
              if (_.contains(validKeys, key)) {
                $scope.vm.selectedService.configs.push({
                  key: key,
                  value: value
                });
              }
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
            return popup_horn.error(err);

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
            return popup_horn.error(err);

          $scope.vm.selectedService.logs = logs;

          $('#logsModal').modal('show');
        }
      );
    }

    function showSaveModal() {
      $('#saveModal').modal('show');
    }

    function showRemoveSMIModal(image) {
      $scope.vm.selectedSMI = image;
      $('#remove-smi-modal').modal('show');
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

    function showApplyChangesModal() {
      $('#applyModal').modal('show');
    }

    function showSaveAndRestartModal() {
      $('#save-restart-modal').modal('show');
    }

    function hideRestartServicesModal() {
      $('#restartServicesModal').modal('hide');
    }

    $scope.$on('showEULAModal', showEULAModal);

    function showEULAModal() {
      $scope.vm.eulaText = [];
      admiralApiAdapter.getEULAText(
        function (err, eula) {
          if (err)
            return popup_horn.error(err);
          $scope.vm.eulaText = eula.join('\n');

          $('#eulaModal').modal('show');
        }
      );
    }


    function refreshLogs() {
      admiralApiAdapter.getServiceLogs($scope.vm.selectedService.serviceName,
        function (err, logs) {
          if (err)
            return popup_horn.error(err);

          $scope.vm.selectedService.logs = logs;
        }
      );
    }

    function installAddons() {
      $scope.vm.installingAddons = true;
      if (!$scope.vm.isEmailEnabled) {
        $scope.vm.isEmailMethodEnabled = false;
        $scope.vm.installForm.notification.gmailCreds.isEnabled = false;
        $scope.vm.installForm.notification.mailgunCreds.isEnabled = false;
        $scope.vm.installForm.notification.smtpCreds.isEnabled = false;
      }
      var bag = {};
      async.series([
          updateMasterIntegrations,
          updateAddonsPanelSystemSettings,
          updateAddonsPanelSystemIntegrations,
          updateGmailSystemIntegration,
          updateMailgunSystemIntegration,
          updateSMTPSystemIntegration,
          updateIrcService,
          updateFilestoreSystemIntegration,
          getEnabledServices.bind(null, bag),
          deleteAddonServices.bind(null, bag),
          deleteIrcService.bind(null, bag),
          startAddonServices.bind(null, bag),
          startOrStopIntercomProc,
          getServices.bind(null, {}),
        ],
        function (err) {
          $scope.vm.installingAddons = false;
          if (err)
            return popup_horn.error(err);
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
            return done();

          if (masterIntName === 'irc' &&
            masterInt.isEnabled === addonsMasterInt.isEnabled)
            return done();

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

      if (_.isEmpty($scope.vm.addonsForm.systemSettings)) return next();

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
            popup_horn.error(err);
          return next();
        }
      );
    }

    function startOrStopIntercomProc(next) {
      var intercomProcService = _.findWhere($scope.vm.allServices,
        {serviceName: 'intercomProc'});
      if ($scope.vm.addonsForm.systemIntegrations.intercom.isEnabled &&
        !intercomProcService.isEnabled) {
        startService('intercomProc',
          function (err) {
            if (err)
              return next(err);

            return next();
          }
        );
      } else if (!$scope.vm.addonsForm.systemIntegrations.intercom.isEnabled &&
        intercomProcService.isEnabled) {
        admiralApiAdapter.deleteService('intercomProc', {},
          function (err) {
            if (err)
              return next(err);

            return next();
          }
        );
      } else {
        return next();
      }
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
              return popup_horn.error(err);
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
              return popup_horn.error(err);
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
            popup_horn.error(err);
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
            popup_horn.error(err);
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
            popup_horn.error(err);
          $scope.vm.superUsers.superUsers = superUsers;
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

    function logOutOfAdmiral(e) {
      admiralApiAdapter.postLogout({},
        function (err) {
          if (err)
            return popup_horn.error(err);

          e.preventDefault();
          $state.go('login2', $state.params);
          window.scrollTo(0, 0);
        }
      );
    }

    function switchToggle() {
      $scope.vm.resetSwitchForAmazonKeys = true;
      $timeout(toggleAmazonKeysSwitch, 200);
    }

    function toggleAmazonKeysSwitch () {
      $scope.vm.resetSwitchForAmazonKeys = false;
    }

    function isGlobalService(service) {
      return _.contains($scope.vm.globalServices, service);
    }

    function hasDefaultx86SystemMachineImage() {
      if (!$scope.vm.installForm.systemMachineImages ||
        !$scope.vm.installForm.systemMachineImages.length)
        return false;
      return _.some($scope.vm.installForm.systemMachineImages,
        function (systemMachineImage) {
          return systemMachineImage.isDefault &&
            systemMachineImage.archTypeCode === $scope.vm.x86ArchCode;
        }
      );
    }
    function hasDefaultArmSystemMachineImage() {
      if (!$scope.vm.installForm.systemMachineImages ||
        !$scope.vm.installForm.systemMachineImages.length)
        return false;
      return _.some($scope.vm.installForm.systemMachineImages,
        function (systemMachineImage) {
          return systemMachineImage.isDefault &&
            systemMachineImage.archTypeCode === $scope.vm.armArchCode;
        }
      );
    }
  }
}());
