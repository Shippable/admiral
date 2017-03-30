(function () {
  'use strict';

  admiral.controller('dashboard.databaseCtrl', ['$scope', '$stateParams', '$q',
    '$state', 'admiralApiAdapter', 'horn',
    databaseCtrl
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('dashboard.system.database', {
        url: '/database',
        templateUrl: SRC_PATH + 'dashboard/system/database/database.html',
        controller: 'dashboard.databaseCtrl'
      });
    }
  ]);


  function databaseCtrl($scope, $stateParams, $q, $state, admiralApiAdapter,
    horn) {
    $scope._r.title = 'System | Database - Admiral';
    $scope.vm = {
      isLoaded: false
    };

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};
      async.series([
          getDatabaseInfo.bind(null, bag),
          getSystemConfigs.bind(null, bag)
        ],
        function (err) {
          $scope.vm.isLoaded = true;
          if (err)
            return horn.error(err);
          $scope.vm.database = bag.database;
          $scope.vm.systemConfigs = bag.systemConfigs;
        }
      );
    }

    function getDatabaseInfo(bag, next) {
      admiralApiAdapter.getDatabase(
        function (err, database) {
          if (err)
            return next(err);

          bag.database = database;
          return next();
        }
      );
    }

    function getSystemConfigs(bag, next) {
      admiralApiAdapter.getSystemConfigs(
        function (err, systemConfigs) {
          if (err)
            return next(err);

          bag.systemConfigs = systemConfigs;
          return next();
        }
      );
    }
  }
}());
