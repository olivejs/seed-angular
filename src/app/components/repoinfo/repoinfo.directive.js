(function() {

  'use strict';

  angular
    .module('app')
    .directive('repoinfo', repoinfo);

  function repoinfo(Github) {
    var directive = {
      restrict: 'A',
      templateUrl: 'components/repoinfo/repoinfo.html',
      scope: {
        repo: '='
      },
      controller: RepoinfoController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function RepoinfoController($log) {
      var vm = this;

      vm.repo.starsCount = '- -';
      vm.repo.forksCount = '- -';

      Github.getRepo(vm.repo.name)
        .then(function(data) {
          vm.repo.url = data.html_url;
          vm.repo.starsCount = data.stargazers_count;
          vm.repo.forksCount = data.forks_count;
        })
        .catch(function(data) {
          $log.warn('GitHub: ' + data.message);
        });
    }
  }

})();
