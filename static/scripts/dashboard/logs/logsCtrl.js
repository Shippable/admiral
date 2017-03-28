(function () {
  'use strict';

  admiral.controller('dashboard.logsCtrl', ['$scope', '$stateParams', '$q', '$state',
    'admiralApiAdapter', 'horn',
    logsCtrl
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('dashboard.logs', {
        url: 'logs',
        templateUrl: SRC_PATH + 'dashboard/logs/logs.html',
        controller: 'dashboard.logsCtrl'
      });
    }
  ]);

  function logsCtrl($scope, $stateParams, $q, $state, admiralApiAdapter,
    horn) {
    $scope._r.title = 'Logs - Admiral';
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
