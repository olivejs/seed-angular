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

    .state('root', {
      abstract: true,
      url: '',
      views: {
        '@': {
          templateUrl: 'layouts/default/default.html'
        },
        'header@root': {
          templateUrl: 'partials/header/header.html'
        },
        'footer@root': {
          templateUrl: 'partials/footer/footer.html'
        }
      },
    })

    /*

    // Does not use any layout
    .state('other', {
      url: '/other',
      templateUrl: 'pods/other/other.html',
      controller: 'OtherController'
    })

    */

    // Uses default layout
    .state('home', {
      parent: 'root',
      url: '/',
      views: {
        'main': {
          templateUrl: 'pods/home/home.html',
          controller: 'HomeController'
        }
      }
    });

    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise('/');
  }

})();
