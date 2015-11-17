var charts = angular.module('MongoCharts', []);

charts.factory('SchemaTree', ['$window', function($window) {
    return function() {
        var d3 = $window.d3;

        function SchemaTree(selection) {

        }

        return SchemaTree;
    };
}]);