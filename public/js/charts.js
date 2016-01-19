var charts = angular.module('MongoCharts', []);

charts.factory('SchemaTree', ['$window', 'ChartUtils', function($window, ChartUtils) {
    return function() {
        var d3 = $window.d3,
            data,
            width = 600,
            height = 400,
            horizMargin = 80,
            vertMargin = 20,

            findOpposingTarget = function(origin, target) {
                return origin.children.find(function(child, i, cn) {
                    return (i === 0 || i === cn.length - 1) && ((child !== target) === (cn.length !== 1));
                });
            },

            braces = function(d) {
                    var q = 0.6,

                        origin = d.source,
                        target = d.target,
                        oppTarget = findOpposingTarget(origin, target),
                        midpoint = ChartUtils.midPoint(target, oppTarget),

                        slope = ChartUtils.slope(origin, target),
                        orient = (slope <= 0 ? 1 : -1),
                        dist = ChartUtils.distance(target, midpoint),
                        perpDist = (dist / 3),
                        unitVector = ChartUtils.unitVector(midpoint, target),

                        hiltX = ((-unitVector.y * perpDist) + midpoint.x),
                        hiltY = ((unitVector.x * perpDist * orient) + midpoint.y),
                        contX = (target.x + (q * perpDist * unitVector.y)),
                        contY = (target.y + (q * perpDist * unitVector.x * orient)),
                        endX = (target.x - (dist / 2 * unitVector.x) + ((1 - q) * perpDist * unitVector.y)),
                        endY = (target.y - (dist / 2 * unitVector.y) + ((1 - q) * perpDist * unitVector.x * orient));

                return 'M' + [target.y, target.x] +
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

                braceTarget = [links[0].target, links[links.length - 1].target].reduce(function(prev, curr) {
                    return {
                        first: {
                            x: prev.x,
                            y: prev.y
                        },
                        second: {
                            x: curr.x,
                            y: curr.y
                        }
                    };
                }),

                outerLinks = links.filter(function (attr) {
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
                    .attr('stroke-width', function (d) {
                        var target = d.target,
                            other = findOpposingTarget(d.source, target),
                            dist = ChartUtils.distance(target, other);

                        return (Math.round(dist) / 100) + 'px';
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

charts.factory('ChartUtils', [function() {
    return {
        distance: function(first, second) {
            var dx = second.x - first.x,
                dy = second.y - first.y;

            return Math.sqrt((dx * dx) + (dy * dy));
        },
        midPoint: function(first, second) {
            return {
                x: (first.x + second.x) / 2,
                y: (first.y + second.y) / 2
            };
        },
        slope: function(first, second) {
            return (second.x - first.x) / (second.y - first.y);
        },
        unitVector: function(first, second) {
            var distance = this.distance(first, second);

            if (distance === 0) {
                return {
                    x: 0,
                    y: 0
                };
            } else {
                return {
                    x: (second.x - first.x) / distance,
                    y: (second.y - first.y) / distance
                };
            }
        }
    };
}]);