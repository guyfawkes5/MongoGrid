var charts = angular.module('MongoCharts', []);

charts.factory('SchemaTree', ['$window', 'ChartUtils', function($window, ChartUtils) {
    return function() {
        var d3 = $window.d3,
            data,
            width = 600,
            height = 400,
            horizMargin = 80,
            vertMargin = 20,
            perpDistProportion = 0.3,
            minPerpDist = 15,
            nodePadding = 2,
            duration = 750,
            formerSelection = null,

            generateBrace = function(origin, edge, centre) {
                var slope = ChartUtils.slope(origin, edge),
                    orient = (slope <= 0 ? 1 : -1),
                    overreachVector = {
                        x: 15,
                        y: 0
                    },
                    q = 0.6;

                edge = ChartUtils.translate(edge, {
                    x: overreachVector.x * -orient,
                    y: overreachVector.y * -orient
                });

                var dist = ChartUtils.distance(edge, centre),
                    perpDist = Math.max(dist * perpDistProportion, minPerpDist),
                    unitVector = ChartUtils.unitVector(centre, edge);

                return {
                    hilt: {
                        x: (-unitVector.y * perpDist) + centre.x,
                        y: (unitVector.x * perpDist * orient) + centre.y
                    },
                    cont: {
                        x: edge.x + (q * perpDist * unitVector.y),
                        y: edge.y + (q * perpDist * unitVector.x * orient)
                    },
                    centre: {
                        x: edge.x - (dist / 2 * unitVector.x) + ((1 - q) * perpDist * unitVector.y),
                        y: edge.y - (dist / 2 * unitVector.y) + ((1 - q) * perpDist * unitVector.x * orient)
                    },
                    tip: edge
                };
            },

            getStrokeWidth = function (target, other) {
                var dist = ChartUtils.distance(target, other),
                    minWidth = 1;

                return Math.max((Math.round(dist) / 100), minWidth);
            },

            filterLinksToBraceTargets = function (attr) {
                var target = attr.target,
                    children = attr.source.children,
                    childIndex = children.indexOf(target),
                    isFirstChild = (childIndex === 0),
                    lastChild = children[children.length - 1];

                if (isFirstChild) {
                    target.isSinglePoint = (target === lastChild);
                    target.other = lastChild;
                }

                return isFirstChild;
            },

            bracesPath = function(target, origin, isSingle, other) {
                var singleWidthVector = {
                        x: 40,
                        y: 0
                    },
                    target = isSingle ? {
                        x: target.x + (singleWidthVector.x / 2),
                        y: target.y + (singleWidthVector.y / 2)
                    } : target,
                    other = isSingle ? {
                        x: target.x - singleWidthVector.x,
                        y: target.y - singleWidthVector.y
                    } : other,

                    braceCentre = ChartUtils.midPoint(target, other),
                    leftBrace = generateBrace(origin, target, braceCentre),
                    rightBrace = generateBrace(origin, other, braceCentre);

                return 'M' + [leftBrace.tip.y, leftBrace.tip.x] +
                    'Q' + [leftBrace.cont.y, leftBrace.cont.x] + ' ' + [leftBrace.centre.y, leftBrace.centre.x] +
                    'T' + [leftBrace.hilt.y, leftBrace.hilt.x] + 'M' + [rightBrace.tip.y, rightBrace.tip.x] +
                    'Q' + [rightBrace.cont.y, rightBrace.cont.x] + ' ' + [rightBrace.centre.y, rightBrace.centre.x] +
                    'T' + [rightBrace.hilt.y, rightBrace.hilt.x];
            },

            drawStemPolyPoints = function(target, source, other) {
                var width = getStrokeWidth(target, other),
                    widthVector = {
                        x: 1,
                        y: 0
                    },
                    centre = ChartUtils.midPoint(target, other),
                    orient = (ChartUtils.slope(target, other) <= 0 ? 1 : -1),
                    hiltLength =  Math.max(ChartUtils.distance(target, other) / 2 * perpDistProportion, minPerpDist),
                    hilt = {
                        x: hiltLength * widthVector.y,
                        y: hiltLength * widthVector.x
                    },
                    end = {
                        x: (centre.x - source.x - hilt.x) * -orient,
                        y: (centre.y - source.y - hilt.y) * -orient
                    },
                    xWidth = (width / 2 * widthVector.x),
                    yWidth = (width / 2 * widthVector.y);

                return [0, 0] +
                    ' ' + [end.y + (yWidth * orient), end.x + (xWidth * orient)] +
                    ' ' + [end.y + (yWidth * -orient), end.x + (xWidth * -orient)];
            },

            oldNode, clickListener;

        function SchemaTree(selection) {
            selection.select('svg').selectAll('*').remove();

            var svg = selection.select('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + horizMargin + ',' + vertMargin + ')'),

                tree = d3.layout.tree().size([height - (vertMargin * 2), width - (horizMargin * 2)]),
                nodes = tree.nodes(data),
                links = tree.links(nodes),

                outerLinks = links.filter(filterLinksToBraceTargets),

                node = svg.selectAll('g.node')
                    .data(nodes),

                nodeEnter = node.enter()
                    .append('g')
                    .attr('class', 'node')
                    .attr('class', function(d) {
                        return 'node' + (d.selected ? ' selected-node' : '');
                    })
                    .attr('transform', function (d) {
                        return 'translate(' + (d.y0 || d.y) + ',' + (d.x0 || d.x) + ')';
                    }),

                braces = svg.selectAll('path.brace')
                    .data(outerLinks),

                stem = svg.selectAll('polygon.stem')
                    .data(outerLinks);

            braces.enter()
                .append('path')
                .attr('class', 'brace')
                .attr('d', function(d) {
                    var target = d.target,
                        source = d.source,
                        other = target.other;

                    return bracesPath({
                        x: target.x0 || target.x,
                        y: target.y0 || target.y
                    }, {
                        x: source.x0 || source.x,
                        y: source.y0 || source.y
                    }, target.isSinglePoint, {
                        x: other.x0 || other.x,
                        y: other.y0 || other.y
                    });
                })
                .attr('stroke-width', function(d) {
                    return getStrokeWidth(d.target, d.target.other) + 'px';
                });

            stem.enter()
                .insert('polygon', ':first-child')
                .attr('class', 'stem')
                .attr('points', function(d) {
                    var target = d.target,
                        source = d.source,
                        other = target.other;

                    return drawStemPolyPoints({
                        x: target.x0 || target.x,
                        y: target.y0 || target.y
                    }, {
                        x: source.x0 || source.x,
                        y: source.y0 || source.y
                    }, {
                        x: other.x0 || other.x,
                        y: other.y0 || other.y
                    });
                })
                .attr('transform', function (d) {
                    var source = d.source;
                    return 'translate(' + (source.y0 || source.y) + ',' + (source.x0 || source.x) + ')';
                });

            nodeEnter.append('circle')
                .attr('r', 4.5);

            nodeEnter.append('text')
                .attr('dx', 8)
                .attr('dy', 3)
                .attr('text-anchor', 'start')
                .text(function (d) {
                    return d.name + (d.type ? ' (' + d.type + ')' : '' );
                });

            nodeEnter.insert('rect', ':first-child')
                .attr('class', 'text-bg')
                .attr('width', function() {
                    return this.parentNode.getBBox().width + (nodePadding * 2);
                })
                .attr('height', function() {
                    return this.parentNode.getBBox().height + (nodePadding * 2);
                })
                .attr('x', function() {
                    return this.parentNode.getBBox().x;
                })
                .attr('y', function() {
                    return this.parentNode.getBBox().y;
                });

            node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            braces.transition()
                .duration(duration)
                .attr('d', function(d) {
                    return bracesPath(d.target, d.source, d.target.isSinglePoint, d.target.other);
                });

            stem.transition()
                .duration(duration)
                .attr('points', function(d) {
                    return drawStemPolyPoints(d.target, d.source, d.target.other);
                })
                .attr('transform', function (d) {
                    var source = d.source;
                    return 'translate(' + source.y + ',' + source.x + ')';
                });

            if (clickListener) {
                node.on('click', function(d) {
                    if (formerSelection) {
                        formerSelection.selected = false;
                    }

                    d.selected = true;
                    formerSelection = d;
                    clickListener(d);
                    SchemaTree.draw();
                });
            }

            outerLinks.forEach(function(d) {
                var source = d.source,
                    target = d.target;

                source.x0 = source.x;
                source.y0 = source.y;
                target.x0 = target.x;
                target.y0 = target.y;
            });

            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
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
        },
        translate: function(point, vector) {
            return {
                x: point.x + vector.x,
                y: point.y + vector.y
            };
        }
    };
}]);