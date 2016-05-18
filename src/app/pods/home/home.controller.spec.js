(function() {

  'use strict';

  describe('HomeController', function() {

    var $scope;

    beforeEach(module('app'));

    beforeEach(inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('HomeController', { $scope: $scope });
    }));

    it('- should have githubRepo object with a name attribute', function() {
      expect(angular.isObject($scope.githubRepo)).toBeTruthy();
      expect(typeof $scope.githubRepo.name).toBe('string');
    });

    // it('- should have appInfo object with a name and version attributes', function() {
    //   expect(angular.isObject($scope.appInfo)).toBeTruthy();
    //   expect(typeof $scope.appInfo.name).toBe('string');
    //   expect(typeof $scope.appInfo.version).toBe('string');
    // });

  });

})();
