(function () {
  'use strict';

  admiral.controller('dashboard.installCtrl', ['$scope', '$stateParams', '$q',
    '$state', 'admiralApiAdapter', 'horn',
    installCtrl
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('dashboard.system.install', {
        url: '/install',
        templateUrl: SRC_PATH + 'dashboard/system/install/install.html',
        controller: 'dashboard.installCtrl'
      });
    }
  ]);


  function installCtrl($scope, $stateParams, $q, $state, admiralApiAdapter,
    horn) {
    $scope._r.title = 'System | Install - Admiral';
    $scope.vm = {
      isLoaded: false,
      initializing: false,
      initialize: initialize
    };

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};
      async.series([
          getSystemConfigs.bind(null, bag)
        ],
        function (err) {
          $scope.vm.isLoaded = true;
          if (err)
            return horn.error(err);
          $scope.vm.systemConfigs = bag.systemConfigs;
        }
      );
    }

    function getSystemConfigs(bag, next) {
      admiralApiAdapter.getSystemConfigs(
        function (err, systemConfigs) {
          if (err)
            return next(err);

          bag.systemConfigs = systemConfigs;
          bag.dbStatus = JSON.parse(systemConfigs.db);

          $scope.vm.dbInitialized = bag.dbStatus && bag.dbStatus.isInitialized;


          return next();
        }
      );
    }
    function initialize() {
      $scope.vm.initializing = true;
      var bag = {};
      async.series([
          initializeDatabase.bind(null, bag),
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
    function initializeDatabase(bag, next) {

      admiralApiAdapter.postDatabase({},
        function (err) {
          return next(err);
        }
      );
    }

  }
}());
