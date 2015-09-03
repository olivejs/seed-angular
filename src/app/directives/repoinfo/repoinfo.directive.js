(function() {

  'use strict';

  angular
    .module('app')
    .directive('repoinfo', repoinfo);

  function repoinfo(Github) {
    return {
      restrict: 'A',
      templateUrl: 'directives/repoinfo/repoinfo.html',
      scope: {
        repo: '='
      },
      controller: RepoinfoController
    };

    function RepoinfoController($scope, $log) {

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
  }

})();
