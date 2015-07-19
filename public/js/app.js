var app = angular.module('MongoUI', ['ui.grid']);

app.controller('MongoUICtrl', ['$scope', function($scope) {
   $scope.gridOptions = {
      data: [{
         name: 'Test',
         value: 123
      }]
   };
}]);