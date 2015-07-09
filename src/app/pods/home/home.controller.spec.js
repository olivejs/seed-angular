(function() {

  'use strict';

  describe('HomeController', function() {

    beforeEach(module('application'));

    var $controller;

    beforeEach(inject(function(_$controller_) {
      $controller = _$controller_;
    }));

    it('$scope should have githubRepo object with a name attribute', function() {
      var $scope = {};
      $controller('HomeController', { $scope: $scope });

      expect(angular.isObject($scope.githubRepo)).toBeTruthy();
      expect(typeof $scope.githubRepo.name).toBe('string');
    });

  });

})();
