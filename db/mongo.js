var Mongo = require('mongodb'),
    MongoClient = Mongo.MongoClient,

    Q = require('q'),
    utils = require('../utils/utils'),

    KEY_SEPARATOR = '$',

    db;

module.exports = {
    connect: connect,
    getKeys: getKeys
};

function map() {
    function isObject(value) {
        return value === Object(value) && !Array.isArray(value);
    }

    function isBuffer(value) {
        return value.constructor.name === 'BinData';
    }

    function getNestedKeys(object, prefix, original) {
        var ret = original || {};

        prefix = (prefix ? prefix + '$' : '');

        if (isObject(object) && !isBuffer(object)) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var value = object[key],
                        builtKey = prefix + key;

                    ret[builtKey] = getType(value);
                    if (isObject(value)) {
                        getNestedKeys(value, builtKey, ret);
                    }
                }
            }
        }
        return ret;
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
            return 'Byte';
        } else if (isObject(v)) {
            return '{}';
        } else {
            return typeof v;
        }
    }

    for (var key in this) {
        emit(key, {
            keys: getNestedKeys(this[key]),
            type: getType(this[key])
        });
    }
}

function reduce(key, values) {
    var reduced = {},
        types = [];

    for (var i = 0; i < values.length - 1; i++) {
        var parent = values[i],
            keys = parent.keys;

        for (var key in keys) {
            if (reduced[key]) {
                reduced[key].$types.push(keys[key]);
            } else {
                reduced[key] = {
                    $types: [keys[key]]
                };
            }
        }

        types.push(parent.type);
    }

    reduced.$types = types;

    return reduced;
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
                gotKeys.resolve(splitKeys(docs));
            } else {
                gotKeys.reject(err);
            }
        });
    });
    return gotKeys.promise;
}

function splitKeys(docs) {
    var ret = {};

    utils.each(docs, function(doc) {
        var subRet = {};

        utils.each(doc.value, function(value, key) {
            var isSystemProperty = utils.beginsWith(key, KEY_SEPARATOR),
                isSplittableKey = utils.contains(key, KEY_SEPARATOR);

            if (isSystemProperty) {
                console.log(value);
            } else if (isSplittableKey) {
                var splitKeys = key.split(KEY_SEPARATOR);


            } else {

            }
        });

        ret[doc._id] = [];
    });

    return ret;
}