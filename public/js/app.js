var app = angular.module('MongoUI', []);

app.controller('MongoUICtrl', ['$http', '$scope', function($http, $scope) {
    var width = window.innerWidth,
        height = window.innerHeight,

        duration = 3000,

        chart = d3.select('#d3-cont').append('svg').attr('width', width).attr('height', height).append("g")
            .attr("transform", "translate(100,0)"),

        diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; }),

        tree = d3.layout.tree().size([height, (width * 2) / 3]);

   $http.get('/mongo/schema').then(function(response) {
       var nodes = tree.nodes(response.data),
           links = tree.links(nodes),

           link = chart.selectAll("path.link")
           .data(links)
           .enter().append("path")
           .attr("class", "link")
           .attr("d", diagonal),

           node = chart.selectAll("g.node")
           .data(nodes)
           .enter()
           .append("g")
           .attr("class", "node")
           .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

       node.append("circle")
           .attr("r", 4.5);

       node.append("text")
           .attr("dx", function(d) { return d.children ? -8 : 8; })
           .attr("dy", 3)
           .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
           .text(function(d) {  return d.name + (d.type ? ' (' + d.type + ')' : '' ); });
   });
}]);