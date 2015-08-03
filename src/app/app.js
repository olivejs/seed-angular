(function() {

  'use strict';

  angular
    .module('application', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {

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
