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
                if (data.depth === 0) {
                    return;
                }

                var keys = [data.name],
                    type = data.type;

                while ((data = data.parent) && data.depth > 0) {
                    keys.unshift(data.name);
                }

                $scope.$emit('schemaClick', {
                    keys: keys,
                    type: type
                });
            });

    $scope.$on('resize', function() {
        chart.width(chartEl.prop('offsetWidth')).height(chartEl.prop('offsetHeight')).draw();
    });

    MongoDB.schema().$promise.then(function(data) {
        chart.data(data.toJSON()).draw(chartEl);
    });
}]);

mongoControllers.controller('valueGridController', ['$scope', 'MongoDB', function($scope, MongoDB) {
    $scope.$on('schemaLoad', function(event, lookup) {
        var keys = lookup.keys,
            type = lookup.type,
            previousValues;

        MongoDB.get({queryString: keys.join('.')}).$promise.then(function(rows) {
            var formatted = [],
                name = keys.join('.');

            angular.forEach(rows, function(row) {
                var data = row.toJSON(),
                    value = data;

                angular.forEach(keys, function(key) {
                    value = value[key];
                });

                if (angular.isObject(value)) {
                    value = type;
                }

                var match = null;

                angular.forEach(formatted, function(entry) {
                    if (entry.value === value) {
                        match = entry;
                    }
                });

                if (match) {
                    match.count++;
                } else {
                    formatted.push({
                       name: name,
                       value: value,
                       count: 1
                   });
                }
            });

            $scope.rowCollection = formatted;
        });
    });
}]);