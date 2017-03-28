(function () {
  'use strict';

  admiral.controller('dashboard.databaseCtrl', ['$scope', '$stateParams', '$q', '$state',
    'admiralApiAdapter', 'horn',
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
      async.series([
      ],
        function (err) {
          $scope.vm.isLoaded = true;
          if (err)
            return horn.error(err);
        }
      );
    }
  }
}());
