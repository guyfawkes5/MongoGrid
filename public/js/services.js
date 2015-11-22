var mongoServices = angular.module('mongoServices', ['ngResource']);

mongoServices.factory('MongoDB', ['$resource', function($resource) {
    return $resource('mongo/:verb', {}, {
        get: {
            method: 'GET',
            isArray: true,
            params: {
                query: '@queryString'
            }
        },
        schema: {
            method: 'GET',
            params: {
                verb: 'schema'
            }
        }
    });
}]);