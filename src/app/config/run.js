(function() {

  'use strict';

  angular
    .module('app')
    .run(runBlock);

  function runBlock($log) {

    //--> Do your magic here

    $log.debug('runBlock ends');
  }

})();
