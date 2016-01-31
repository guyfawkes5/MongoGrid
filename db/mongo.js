var Mongo = require('mongodb'),
    MongoClient = Mongo.MongoClient,

    Q = require('q'),
    utils = require('../utils/utils'),

    KEY_SEPARATOR = '$',

    db;

module.exports = {
    connect: connect,
    getKeys: getKeys,
    get: get
};

function map() {
    function isObject(value) {
        return value === Object(value) && !Array.isArray(value) && !isBuffer(value);
    }

    function isBuffer(value) {
        return value.constructor.name === 'BinData';
    }

    function getNestedKeys(object) {
        var ret = {};
        if (isObject(object)) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var value = object[key];

                    ret[key] = {
                        name: key,
                        type: getType(value),
                        cn: getNestedKeys(value)
                    };
                }
            }
            return ret;
        } else {
            return null;
        }
    }

    function getArrayType(array) {
        var previousType = null;
        for (var i = 0; i < array.length; i++) {
            var value = array[i],
                type = getType(value);

            if (type === previousType || previousType === null) {
                previousType = type;
            } else {
                previousType = 'Mixed';
            }
        }
        return '[' + (previousType === null ? '' : previousType) + ']';
    }


    function getType(v) {
        if (Array.isArray(v)) {
            return getArrayType(v);
        } else if (isBuffer(v)) {
            return 'Buffer';
        } else if (isObject(v)) {
            return '{}';
        } else {
            return typeof v;
        }
    }

    for (var key in this) {
        emit(key, {
            name: key,
            cn: getNestedKeys(this[key]),
            type: getType(this[key])
        });
    }
}

function reduce(key, values) {
    var ret = {},
        outerBrackets = /^\[(.+)?\]$/;

    for (var i = 0; i < values.length; i++) {
        var value = values[i],
            name = value.name,
            type = value.type,
            cn = value.cn,
            existing = ret[name];

        if (existing) {
            if (existing.cn) {
                apply(existing.cn, cn);
            } else {
                existing.cn = cn;
            }

            if (existing.type) {
                if (isArrayType(type)) {
                    existing.type = mergeArrayTypes(existing.type, type);
                } else if (existing.type !== type) {
                    existing.type = 'Mixed';
                }
            } else {
                existing.type = type;
            }
        } else {
            ret[name] = {
                type: type,
                cn: cn
            };
        }
    }

    function apply(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    function isArrayType(type) {
        return outerBrackets.test(type);
    }

    function mergeArrayTypes(firstArray, secondArray) {
        var firstMatch = firstArray, secondMatch = secondArray,
            firstInner, secondInner;


        while ((firstMatch = outerBrackets.exec(firstMatch)) && (secondMatch = outerBrackets.exec(secondMatch))) {
            firstInner = firstMatch = firstMatch[1];
            secondInner = secondMatch = secondMatch[1];
        }

        if (firstInner === secondInner) {
            return firstArray;
        } else if (firstInner === undefined) {
            return secondArray;
        } else if (secondInner === undefined) {
            return firstArray;
        } else {
            return firstArray.replace(firstInner, 'Mixed');
        }
    }

    return {
        schema: ret
    };
}

function connect(url) {
    var connected = Q.defer();
    MongoClient.connect(url, function(err, database) {
        if (!err) {
            db = database;
            connected.resolve(db);
        } else {
            connected.reject(err);
        }
    });
    return connected.promise;
}

function getKeys() {
    var gotKeys = Q.defer();
    db.collection('exchanges').mapReduce(map, reduce, {out: {replace: 'schema_keys'}}).then(function(coll) {
        coll.find().toArray(function(err, docs) {
            if (!err) {
                var keys = splitKeys(docs);
                gotKeys.resolve(keys);
            } else {
                gotKeys.reject(err);
            }
        });
    });
    return gotKeys.promise;
}

function get(criteria) {
    var key = criteria.name,
        value = criteria.value,
        isValueSearch = !!value,
        queryResponse = Q.defer(),
        query = {},
        filter = {};

    if (!isValueSearch) {
        query[key] = {
            $exists: true
        };
        filter._id = false;
        filter[key] = true;
    } else {
        query[key] = value;
    }

    db.collection('exchanges').find(query, filter, function(err, cursor) {
        if (!err) {
            queryResponse.resolve(cursor.toArray());
        } else {
            queryResponse.reject(err);
        }
    });

    return queryResponse.promise;
}

function splitKeys(docs) {
    var ret = [];

    utils.each(docs, function(doc) {
        ret = ret.concat(schemaToArray(doc.value.schema));
    });

    return {
        name: 'schema',
        children: ret
    };
}

function schemaToArray(schema) {
    var ret = [];

    utils.each(schema, function(value, key) {
        ret.push({
            name: key,
            type: value.type,
            children: schemaToArray(value.cn)
        });
    });

    return ret;
}