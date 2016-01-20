var mongoControllers = angular.module('mongoControllers', ['ngResource']);

mongoControllers.controller('mongoController', ['$scope', function($scope) {
    $scope.$on('schemaClick', function(event, data) {
        $scope.$broadcast('schemaLoad', data);
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
                $scope.$emit('schemaClick', parseItemToParents(data));
            });

    $scope.$on('resize', function() {
        chart.width(chartEl.prop('offsetWidth')).height(chartEl.prop('offsetHeight')).draw();
    });

    MongoDB.schema().$promise.then(function(data) {
        data.children[3].children.pop();
        data.children[3].children.pop();
        chart.data(data.toJSON()).draw(chartEl);
    });

    $window.chart = chart;

    function parseItemToParents(data) {
        if (data.depth === 0) {
            return;
        }

        var keys = [data.name],
            type = data.type;

        while ((data = data.parent) && data.depth > 0) {
            keys.unshift(data.name);
        }

        return {
            keys: keys,
            type: type
        };
    }
}]);

mongoControllers.controller('valueGridController', ['$scope', 'MongoDB', function($scope, MongoDB) {
    $scope.$on('schemaLoad', function(event, lookup) {
        var keys = lookup.keys,
            type = lookup.type;

        MongoDB.get({queryString: keys.join('.')}).$promise.then(function(data) {
            $scope.rowCollection = formatToRows(data, keys, type);
            $scope.displayedCollection = [].concat($scope.rowCollection);
        });
    });

    $scope.$on('select', function($event, data) {
        console.log(arguments);
    });

    function formatToRows(data, schemaKeys, schemaType) {
        var rows = [],
            name = schemaKeys.join('.');

        angular.forEach(data, function(row) {
            var value = row.toJSON();

            angular.forEach(schemaKeys, function (key) {
                value = value[key];
            });

            if (angular.isObject(value)) {
                value = schemaType;
            }

            var match = null;

            angular.forEach(rows, function (entry) {
                if (entry.value === value) {
                    match = entry;
                }
            });

            if (match) {
                match.count++;
            } else {
                rows.push({
                    name: name,
                    value: value,
                    count: 1
                });
            }
        });

        return rows;
    }
}]);