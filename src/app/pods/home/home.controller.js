(function() {

  'use strict';

  angular
    .module('application')
    .controller('HomeController', function($scope) {
      $scope.githubRepo = {
        name: 'mohislm/ginger'
      };
    });

})();
