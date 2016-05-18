(function() {

  'use strict';

  angular
    .module('app')
    .controller('HomeController', controller);

  function controller($scope, $appInfo) {
    $scope.githubRepo = {
      name: 'olivejs/seed-angular'
    };

    $scope.appInfo = $appInfo;
  }

})();
