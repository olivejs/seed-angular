(function() {

  'use strict';

  angular
    .module('application')
    .directive('navbar', function($log, Github) {
      return {
        restrict: 'E',
        templateUrl: 'components/navbar/navbar.html',
        scope: {
          repo: '='
        },
        controller: function($scope) {
          $scope.repo.starsCount = '- -';
          $scope.repo.forksCount = '- -';
          Github.getRepo($scope.repo.name)
            .then(function(data) {
              $scope.repo.url = data.html_url;
              $scope.repo.starsCount = data.stargazers_count;
              $scope.repo.forksCount = data.forks_count;
            })
            .catch(function(data) {
              $log.warn('GitHub: ' + data.message);
            });
        }
      };
    });

})();
