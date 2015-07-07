(function() {

  'use strict';

  angular
    .module('application', ['ngRoute'])
    .config(function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'pods/home/home.html',
          controller: 'HomeController'
        })
        .otherwise({
          redirectTo: '/'
        });
    });

})();
