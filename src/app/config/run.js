(function() {

  'use strict';

  angular
    .module('app')
    .run(runBlock);

  function runBlock($log, $appInfo) {

    //--> Do your magic here

    $log.debug($appInfo.name + ' ' + $appInfo.version);
  }

})();
