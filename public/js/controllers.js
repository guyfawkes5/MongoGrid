var mongoControllers = angular.module('mongoControllers', ['ngResource']);

mongoControllers.controller('mongoController', ['$scope', function($scope) {
    $scope.$on('schemaClick', function(event, queryString) {
        $scope.$broadcast('schemaLoad', queryString);
    });
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
                    qualifiedName.unshift(data.name);
                }

                $scope.$emit('schemaClick', qualifiedName.join('.'));
            });

    $scope.$on('resize', function() {
        chart.width(chartEl.prop('offsetWidth')).height(chartEl.prop('offsetHeight')).draw();
    });

    MongoDB.schema().$promise.then(function(data) {
        chart.data(data.toJSON()).draw(chartEl);
    });
}]);

mongoControllers.controller('valueGridController', ['$scope', 'MongoDB', function($scope, MongoDB) {
    $scope.$on('schemaLoad', function(event, queryString) {
        MongoDB.get({queryString: queryString}).$promise.then(function(rows) {
            var formatted = [];

            angular.forEach(rows, function(row) {
                var data = row.toJSON(),
                    keys = [];

                while (angular.isObject(data)) {
                    angular.forEach(data, function(value, key) {
                        keys.push(key);
                        data = value;
                    });
                }

                formatted.push({
                    name: keys.join('.'),
                    value: data
                });
            });

            $scope.rowCollection = formatted;
        });
    });
}]);