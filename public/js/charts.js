var charts = angular.module('MongoCharts', []);

charts.factory('SchemaTree', ['$window', function($window) {
    return function() {
        var d3 = $window.d3,
            width = 600,
            height = 400,
            horizMargin = 80,
            vertMargin = 20,

            diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; }),
            oldSelection;

        function SchemaTree(selection) {
            oldSelection = selection;
            selection.selectAll('svg').remove();

            var svg = selection.append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + horizMargin + ',' + vertMargin + ')'),

                tree = d3.layout.tree().size([height - (vertMargin * 2), width - (horizMargin * 2)]),
                nodes = tree.nodes(selection.datum()),
                links = tree.links(nodes),

                link = svg.selectAll('path.link')
                    .data(links)
                    .enter().append('path')
                    .attr('class', 'link')
                    .attr('d', diagonal),

                node = svg.selectAll('g.node')
                    .data(nodes)
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .attr('transform', function(d) {
                        return 'translate(' + d.y + ',' + d.x + ')';
                    });

            node.append('circle')
                .attr('r', 4.5);

            node.on('click', function(d) {
                console.log(this, d);
            });

            node.append('text')
                .attr('dx', function(d) { return d.children ? -8 : 8; })
                .attr('dy', 3)
                .attr('text-anchor', function(d) {
                    return d.children ? 'end' : 'start';
                })
                .text(function(d) {
                    return d.name + (d.type ? ' (' + d.type + ')' : '' );
                });
        }

        SchemaTree.width = function(value) {
            if (!arguments.length) {
                return width;
            }
            width = value;
            return SchemaTree;
        };

        SchemaTree.height = function(value) {
            if (!arguments.length) {
                return height;
            }
            height = value;
            return SchemaTree;
        };

        SchemaTree.horizMargin = function(value) {
            if (!arguments.length) {
                return horizMargin;
            }
            horizMargin = value;
            return SchemaTree;
        };

        SchemaTree.vertMargin = function(value) {
            if (!arguments.length) {
                return vertMargin;
            }
            vertMargin = value;
            return SchemaTree;
        };

        SchemaTree.diagonal = function(value) {
            if (!arguments.length) {
                return diagonal;
            }
            diagonal = value;
            return SchemaTree;
        };

        SchemaTree.redraw = function() {
            return SchemaTree(oldSelection);
        };

        return SchemaTree;
    };
}]);