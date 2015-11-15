var mongoServices = angular.module('mongoServices', ['ngResource']);

mongoServices.factory('MongoDB', ['$resource', function($resource) {
    return $resource('mongo/:verb', {}, {
        get: {
            method: 'GET',
            params: {
                query: '@queryString'
            }
        },
        query: {
            method: 'GET',
            params: {
                verb: 'schema'
            }
        }
    });
}]);