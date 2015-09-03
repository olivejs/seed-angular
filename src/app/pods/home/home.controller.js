(function() {

  'use strict';

  angular
    .module('app')
    .controller('HomeController', HomeController);

  function HomeController($scope) {
    $scope.githubRepo = {
      name: 'olivejs/seed-angular'
    };
  }

})();
