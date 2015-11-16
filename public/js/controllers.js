var mongoControllers = angular.module('mongoControllers', ['ngResource']);

mongoControllers.controller('MongoUICtrl', ['$window', '$scope', 'MongoDB', function($window, $scope, MongoDB) {
    var d3 = $window.d3,
        cont = d3.select('#d3-cont'),
        contEl = cont[0][0],
        width = contEl.offsetWidth,
        height = contEl.offsetHeight,
        horizMargin = 120,
        vertMargin = 20,

        chart = cont.append('svg').attr('width', width).attr('height', height).append("g")
            .attr("transform", "translate(" + horizMargin + "," + vertMargin + ")"),

        diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; }),

        tree = d3.layout.tree().size([height - (vertMargin * 2), width - (horizMargin * 2)]);

    MongoDB.query().$promise.then(function(data) {
        var nodes = tree.nodes(data),
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

        node.on('click', function(d) {
            console.log(this, d);
        });

        node.append("text")
            .attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dy", 3)
            .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) {  return d.name + (d.type ? ' (' + d.type + ')' : '' ); });
    });

    $scope.rowCollection = [{
        name: 'URL',
        value: '/request'
    }];
}]);