(function() {

  'use strict';

  angular
    .module('app')
    .controller('HomeController', HomeController);

  function HomeController($scope, $appInfo) {
    $scope.githubRepo = {
      name: 'olivejs/seed-angular'
    };

    $scope.appInfo = $appInfo;
  }

})();
