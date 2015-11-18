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