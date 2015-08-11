(function() {

  'use strict';

  angular
    .module('app')
    .controller('HomeController', function() {

      var vm = this; //why vm? I haven't understood what this means, even though its 
    //refered to everywhere.

      vm.githubRepo = {
        name: 'olivejs/seed-angular'
      };

    });

})();
