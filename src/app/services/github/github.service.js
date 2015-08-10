(function() {

  'use strict';

  angular
    .module('app')
    .factory('Github', function($q, $http, $window) {
      return {
        getRepo: function(name) {
          return $q(function(resolve, reject) {
            var repo = $window.sessionStorage.getItem('repo');
            // If not cached, make a HTTP request and cache it
            if (repo === null) {
              $http.get('https://api.github.com/repos/' + name)
                .success(function(data) {
                  $window.sessionStorage.setItem('repo', JSON.stringify(data));
                  resolve(data);
                })
                .error(function(data) {
                  reject(data);
                });
            }
            // If already cached, serve it from cache
            else {
              resolve(JSON.parse(repo));
            }
          });
        }
      };
    });

})();
