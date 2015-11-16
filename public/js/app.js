var app = angular.module('MongoUI', ['mongoServices', 'mongoControllers', 'ngRoute', 'smart-table']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/container.html',
        controller: 'MongoUICtrl'
    });
}]);