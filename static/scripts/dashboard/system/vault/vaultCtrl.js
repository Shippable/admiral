(function () {
  'use strict';

  admiral.controller('dashboard.vaultCtrl', ['$scope', '$stateParams', '$q',
    '$state', '$interval', 'admiralApiAdapter', 'horn',
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


  function vaultCtrl($scope, $stateParams, $q, $state, $interval,
    admiralApiAdapter, horn) {
    $scope._r.title = 'System | Vault - Admiral';
    $scope.vm = {
      isLoaded: false,
      vault: null,
      initializingVault: false,
      initializeVault: initializeVault
    };

    $scope._r.appPromise.then(initWorkflow);

    function initWorkflow() {
      var bag = {};
      async.series([
          getVaultInfo.bind(null, bag)
        ],
        function (err) {
          $scope.vm.isLoaded = true;
          if (err)
            return horn.error(err);
          $scope.vm.vault = bag.vault;
        }
      );
    }

    function getVaultInfo(bag, next) {
      admiralApiAdapter.getVault(
        function (err, vault) {
          if (err)
            return next(err);

          bag.vault = vault;
          return next();
        }
      );
    }

    function initializeVault() {
      $scope.vm.initializingVault = true;
      admiralApiAdapter.postVault({},
        function (err) {
          if (err) {
            $scope.vm.initializingVault = false;
            return horn.error(err);
          }

          pollVault();
        }
      );
    }

    function pollVault() {
      var promise = $interval(function () {
        admiralApiAdapter.getVault(
          function (err, vault) {
            if (err) {
              horn.error(err);
              $scope.vm.initializingVault = false;
              $interval.cancel(promise);
            }

            $scope.vm.vault = vault;

            if (vault.isInitialized) {
              $scope.vm.initializingVault = false;
              $interval.cancel(promise);
            }
          }
        );
      }, 5000);
    }
  }
}());
