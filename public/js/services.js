var mongoServices = angular.module('mongoServices', ['ngResource']);

mongoServices.factory('MongoDB', ['$resource', function($resource) {
    return $resource('mongo/:resource', {}, {
        get: {
            method: 'GET',
            isArray: true,
            params: {
                value: '@value'
            }
        },
        schema: {
            method: 'GET',
            params: {
                resource: 'schema'
            }
        }
    });
}]);