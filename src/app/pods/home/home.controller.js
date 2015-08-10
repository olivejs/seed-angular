(function() {

  'use strict';

  angular
    .module('app')
    .controller('HomeController', function() {

      var vm = this;

      vm.githubRepo = {
        name: 'olivejs/seed-angular'
      };

    });

})();
