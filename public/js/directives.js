var directives = angular.module('mongoDirectives', []);

directives.directive('valueGrid', [function() {
    return {
        controller: 'valueGridController',
        templateUrl: 'partials/grid.html',
        restrict: 'A'
    };
}]);

directives.directive('chartContainer', [function() {
    return {
        controller: 'chartContainer',
        templateUrl: 'partials/chartContainer.html',
        restrict: 'A'
    };
}]);

directives.directive('resize', ['$window', function($window) {
    return {
        link: function(scope) {
            angular.element($window).on('resize', function(e) {
                scope.$broadcast('resize');
            });
        },
        restrict: 'A'
    };
}]);