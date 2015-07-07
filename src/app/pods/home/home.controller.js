(function() {

  'use strict';

  angular
    .module('application')
    .controller('HomeController', function($scope) {
      $scope.githubUser = {
        username: 'mohislm'
      };
    });

})();
