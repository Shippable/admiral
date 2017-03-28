(function () {
  'use strict';

  admiral.controller('dashboard.systemCtrl', ['$scope', '$stateParams', '$q', '$state',
    'admiralApiAdapter', 'horn',
    systemCtrl
  ])
  .config(['$stateProvider', 'SRC_PATH',
    function ($stateProvider, SRC_PATH) {
      $stateProvider.state('dashboard.system', {
        url: 'system',
        templateUrl: SRC_PATH + 'dashboard/system/system.html',
        controller: 'dashboard.systemCtrl'
      });
    }
  ]);

  function systemCtrl($scope, $stateParams, $q, $state, admiralApiAdapter,
    horn) {
    
  }
}());
