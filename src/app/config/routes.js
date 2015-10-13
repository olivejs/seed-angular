(function() {

  'use strict';

  angular
    .module('app')
    .config(routesConfig);

  function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {

    // Use html5Mode for modern browsers,
    // and fallback to #! for older browsers and search engine crawlers.
    $locationProvider.html5Mode(true).hashPrefix('!');

    $stateProvider

    .state('home', {
      url: '/',
      templateUrl: 'pods/home/home.html',
      controller: 'HomeController'
    });

    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise('/');
  }

})();
