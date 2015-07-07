(function() {

  'use strict';

  angular
    .module('application')
    .directive('navbar', function($log, Github) {
      return {
        restrict: 'E',
        templateUrl: 'components/navbar/navbar.html',
        scope: {
          user: '='
        },
        controller: function($scope) {
          Github.getUserInfo($scope.user.username)
            .success(function(data) {
              $scope.user.name = data.name;
              $scope.user.avatarUrl = data.avatar_url;
              $scope.user.profileUrl = data.html_url;
            })
            .error(function(data) {
              $log.warn('GitHub: ' + data.message);
              $scope.user.profileUrl = 'https://github.com/' + $scope.user.username;
            });
        }
      };
    });

})();
