(function() {

  'use strict';

  angular
    .module('app')
    .directive('repoinfo', repoinfo);

  function repoinfo(Github) {
    function RepoinfoController($log) {
      var vm = this;

      vm.repo.starsCount = '- -';
      vm.repo.forksCount = '- -';

      Github.getRepo(vm.repo.name)
      //why have the directive concerned with getting data?
      //Woudn't it be better to have the app's data gathered and stored in 
      //one place?

      //Its been a while since I've angulared. Is this the latest 
      // accepted pattern?

        .then(function(data) {
          //yeah, see this makes no sense to me. Yay double binding.
          vm.repo.url = data.html_url;
          vm.repo.starsCount = data.stargazers_count;
          vm.repo.forksCount = data.forks_count;
        })
        .catch(function(data) {
          $log.warn('GitHub: ' + data.message);
        });
    }

    return = {
      restrict: 'A',
      templateUrl: 'components/repoinfo/repoinfo.html',
      scope: {
        repo: '='
      },
      controller: RepoinfoController,
      controllerAs: 'vm',
      bindToController: true
    };

  }

})();
