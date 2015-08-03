(function() {

  'use strict';

  angular
    .module('application', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {

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
    });

})();
