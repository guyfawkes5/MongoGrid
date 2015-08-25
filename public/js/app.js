var app = angular.module('MongoUI', []);

app.controller('MongoUICtrl', ['$http', '$scope', function($http, $scope) {
    var svg = d3.select('#d3-cont').append('svg'),
        schema = svg.append('rect')
            .attr('width', 100)
            .attr('height', 100);

   $http.get('/mongo/schema').then(function(response) {
       svg.selectAll('text')
           .data(response.data)
           .enter()
           .append('text')
           .attr('height', 30)
           .attr('x', 50)
           .attr('y', function(d, i) {
               return i * 30;
           })
           .attr('fill', blue)
           .text(function(d) {
              return d;
           });
   });
}]);