/**
 * Libraries defined at global scope can be registered here as constant service.
 * App related constants can also be registered here.
 */

(function(window) {

  'use strict';

  angular
    .module('app')
    .constant('$appInfo', window.appInfo);

})(this);
