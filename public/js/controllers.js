var mongoControllers = angular.module('mongoControllers', ['ngResource']);

mongoControllers.controller('mongoController', [function() {

}]);

mongoControllers.controller('chartContainer', ['$element', '$window', '$scope', 'SchemaTree', 'MongoDB', function($element, $window, $scope, SchemaTree, MongoDB) {
    var chartEl = $element.children(),
        chart = SchemaTree()
            .width(chartEl.prop('offsetWidth'))
            .height(chartEl.prop('offsetHeight'))
            .horizMargin(120)
            .vertMargin(20)
            .onClick(function(data) {
                if (data.depth === 0) {
                    return;
                }

                var qualifiedName = [data.name];

                while ((data = data.parent) && data.depth > 0) {
                    qualifiedName.unshift(data.name)
                }

                MongoDB.get({queryString: qualifiedName.join('.')});
            });

    $scope.$on('resize', function() {
        chart.width(chartEl.prop('offsetWidth')).height(chartEl.prop('offsetHeight')).draw();
    });

    MongoDB.query().$promise.then(function(data) {
        chart.data(data.toJSON()).draw(chartEl);
    });
}]);

mongoControllers.controller('valueGridController', ['$scope', function($scope) {
    $scope.rowCollection = [{
        name: 'xyz',
        value: '/request'
    }];
}]);