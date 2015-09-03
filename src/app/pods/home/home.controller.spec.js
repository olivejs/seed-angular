(function() {

  'use strict';

  describe('HomeController', function() {

    var $scope;

    beforeEach(module('app'));

    beforeEach(inject(function($controller) {
      $scope = {};
      $controller('HomeController', { $scope: $scope });
    }));

    it('- should have githubRepo object with a name attribute', function() {
      expect(angular.isObject($scope.githubRepo)).toBeTruthy();
      expect(typeof $scope.githubRepo.name).toBe('string');
    });

  });

})();
