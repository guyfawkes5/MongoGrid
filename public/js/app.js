var app = angular.module('MongoUI', []);

app.controller('MongoUICtrl', ['$http', '$scope', function($http, $scope) {
    var chart = d3.select('#d3-cont').append('svg');

    var lineHeight = 30,
        originX = 20,
        originY = 0,
        padding = 20;

   $http.get('/mongo/schema').then(function(response) {
       var schema = chart.append('g')
           .attr('transform', 'translate(' + originX + ', ' + originY + ')');

       schema.append('g')
           .attr('transform', 'translate(' + padding + ', ' + padding + ')')
           .selectAll('text')
           .data(response.data)
           .enter()
           .append('text')
           .attr('height', lineHeight)
           .attr('y', function(d, i) {
               return lineHeight * i;
           })
           .attr('fill', 'white')
           .text(function(d) {
              return d._id;
           });

       var bounds = schema.node().getBBox();
       schema.insert('rect', ':first-child').attr('width', bounds.width + (padding * 2)).attr('height', bounds.height + (padding * 2));
   });
}]);