(function() {

  'use strict';

  describe('HomeController', function() {

    var vm;

    beforeEach(module('app'));

    beforeEach(inject(function($controller) {
      vm = $controller('HomeController');
    }));

    it('- should have githubRepo object with a name attribute', function() {
      expect(angular.isObject(vm.githubRepo)).toBeTruthy();
      expect(typeof vm.githubRepo.name).toBe('string');
    });

  });

})();
