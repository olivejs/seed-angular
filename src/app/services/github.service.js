(function() {

  'use strict';

  angular
    .module('application')
    .factory('Github', function($http) {
      return {
        getUserInfo: function(username) {
          return $http.get('https://api.github.com/users/' + username);
        }
      };
    });

})();
