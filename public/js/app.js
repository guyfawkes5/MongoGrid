var app = angular.module('MongoUI', ['mongoServices', 'mongoControllers', 'mongoDirectives', 'MongoCharts', 'ngRoute', 'smart-table']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/container.html',
        controller: 'mongoController'
    });
}]);