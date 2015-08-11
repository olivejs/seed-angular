(function() {

  'use strict';

  angular
    .module('app')
    .run(runBlock);

  function runBlock($log) { //I haven't used Angular in a while, but what is this? Some comments would be helpful

    //--> Do your magic here

    $log.debug('runBlock ends');
  }

})();
