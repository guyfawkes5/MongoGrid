var charts = angular.module('MongoCharts', []);

charts.factory('SchemaTree', ['$window', function($window) {
    return function() {
        var d3 = $window.d3,
            data,
            width = 600,
            height = 400,
            horizMargin = 80,
            vertMargin = 20,

            findOpposingTarget = function(origin, target) {
                return origin.children.find(function(child, i, cn) {
                    return (i === 0 || i === cn.length - 1) && child !== target;
                });
            },

            braces = function(d) {
                    var q = 0.6,
                        overreachProp = 0.1,
                        overreachMin = 20,

                        origin = d.source,
                        target = d.target,
                        oppTarget = findOpposingTarget(origin, target),

                        orgX = origin.x,
                        orgY = origin.y,
                        tarX = target.x,
                        tarY = target.y,
                        midX = ((tarX + oppTarget.x) / 2),
                        midY = ((tarY + oppTarget.y) / 2),

                        slopeToOrg = ((tarX - orgX) / (tarY - orgY)),
                        orient = (slopeToOrg <= 0 ? 1 : -1),

                        dx = (tarX - midX),
                        dy = (tarY - midY),

                        dist = Math.sqrt((dx * dx) + (dy * dy)),
                        perpDist = (dist / 3),
                        dx = (dx / dist),
                        dy = (dy / dist),

                        tarX = (tarX - ((Math.max(overreachProp * dist, overreachMin) * orient))),

                        dx = (tarX - midX),
                        dy = (tarY - midY),

                        dist = Math.sqrt((dx * dx) + (dy * dy)),
                        perpDist = (dist / 3),
                        dx = (dx / dist),
                        dy = (dy / dist),

                        hiltX = ((-dy * perpDist) + midX),
                        hiltY = ((dx * perpDist * orient) + midY),
                        contX = (tarX + (q * perpDist * dy)),
                        contY = (tarY + (q * perpDist * dx * orient)),
                        endX = (tarX - (dist / 2 * dx) + ((1 - q) * perpDist * dy)),
                        endY = (tarY - (dist / 2 * dy) + ((1 - q) * perpDist * dx * orient));

                return 'M' + [tarY, tarX] +
                    'Q' + [contY, contX] + ' ' + [endY, endX] +
                    'T' + [hiltY, hiltX];
            },

            oldNode, clickListener;

        function SchemaTree(selection) {
            selection.selectAll('svg').remove();

            var svg = selection.append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + horizMargin + ',' + vertMargin + ')'),

                tree = d3.layout.tree().size([height - (vertMargin * 2), width - (horizMargin * 2)]),
                nodes = tree.nodes(data),
                links = tree.links(nodes),

                outerLinks = links.filter(function(attr) {
                    var children = attr.source.children,
                        childIndex = children.indexOf(attr.target),
                        isFirst = (childIndex === 0),
                        isLast = (childIndex === children.length - 1);

                    return isFirst || isLast;
                }),

                brace = svg.selectAll('path.brace')
                    .data(outerLinks)
                    .enter()
                    .append('path')
                    .attr('class', 'brace')
                    .attr('d', braces)
                    .attr('stroke-width', function(d) {
                        var target = d.target,
                            other = findOpposingTarget(d.source, target),
                            dx = (other.x - target.x),
                            dy = (other.y - target.y),
                            dist = Math.sqrt((dx * dx) + (dy * dy));

                        return (Math.round(dist) / 100) + 'px';
                    }),

                link = svg.selectAll('path.link')
                    .data(outerLinks)
                    .enter()
                    .append('path')
                    .attr('stroke-dasharray', '5,5')
                    .attr('class', 'link')
                    .attr('stroke-width', '2px')
                    .attr('d', function(d) {
                        return 'M' + [d.source.y, d.source.x]
                            + 'L' + [d.target.y, d.source.x];
                    }),

                node = svg.selectAll('g.node')
                    .data(nodes)
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .attr('transform', function (d) {
                        return 'translate(' + d.y + ',' + d.x + ')';
                    });

            node.append('circle')
                .attr('r', 4.5);

            node.append('text')
                .attr('dx', 8)
                .attr('dy', 3)
                .attr('text-anchor', 'start')
                .text(function (d) {
                    return d.name + (d.type ? ' (' + d.type + ')' : '' );
                });

            if (clickListener) {
                node.on('click', clickListener);
            }
        }

        SchemaTree.data = function(value) {
            if (!arguments.length) {
                return data;
            }
            data = value;
            return SchemaTree;
        };

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

        SchemaTree.onClick = function(listener) {
            if (!arguments.length) {
                return listener;
            }
            clickListener = listener;
            return SchemaTree;
        };

        SchemaTree.draw = function(angElement) {
            var node = angElement ? angElement[0] : oldNode,
                selection = $window.d3.select(node);

            oldNode = node;

            return SchemaTree(selection);
        };

        return SchemaTree;
    };
}]);