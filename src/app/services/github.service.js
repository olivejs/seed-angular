(function() {

  'use strict';

  angular
    .module('application')
    .factory('Github', function($http) {
      return {
        getRepo: function(name) {
          return $http.get('https://api.github.com/repos/' + name);
        }
      };
    });

})();
