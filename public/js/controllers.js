var mongoControllers = angular.module('mongoControllers', ['ngResource']);

mongoControllers.controller('mongoController', [function() {

}]);

mongoControllers.controller('chartContainer', ['$scope', '$window', 'MongoDB', 'SchemaTree', function($scope, $window, MongoDB, SchemaTree) {
    var d3 = $window.d3,
        cont = d3.select('#chart-el'),
        contEl = cont[0][0],
        chart = SchemaTree()
            .width(contEl.offsetWidth)
            .height(contEl.offsetHeight)
            .horizMargin(120)
            .vertMargin(20);

    $window.onresize = function() {
        chart.width(contEl.offsetWidth).height(contEl.offsetHeight).redraw();
    };

    MongoDB.query().$promise.then(function(data) {
        cont.datum(data.toJSON()).call(chart);
    });
}]);

mongoControllers.controller('valueGridController', ['$scope', function($scope) {
    $scope.rowCollection = [{
        name: 'xyz',
        value: '/request'
    }];
}]);