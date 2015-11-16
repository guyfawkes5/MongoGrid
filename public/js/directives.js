var directives = angular.module('mongoDirectives', []);

directives.directive('valueGrid', [function() {
    return {
        controller: 'valueGridController',
        templateUrl: 'partials/grid.html',
        restrict: 'A'
    };
}]);

directives.directive('d3Container', [function() {
    return {
        controller: 'd3Controller',
        templateUrl: 'partials/d3container.html',
        restrict: 'A'
    };
}]);