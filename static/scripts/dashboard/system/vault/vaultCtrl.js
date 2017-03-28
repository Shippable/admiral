(function () {
  'use strict';

  admiral.controller('dashboard.vaultCtrl', ['$scope', '$stateParams', '$q', '$state',
    'admiralApiAdapter', 'horn',
    vaultCtrl
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('dashboard.system.vault', {
        url: '/vault',
        templateUrl: SRC_PATH + 'dashboard/system/vault/vault.html',
        controller: 'dashboard.vaultCtrl'
      });
    }
  ]);


  function vaultCtrl($scope, $stateParams, $q, $state, admiralApiAdapter,
    horn) {
    $scope._r.title = 'System | Vault - Admiral';
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
