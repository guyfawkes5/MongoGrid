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
    return {
        values: values,
        key: key
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
                gotKeys.resolve(splitKeys(docs));
            } else {
                gotKeys.reject(err);
            }
        });
    });
    return gotKeys.promise;
}

function splitKeys(docs) {
    return docs;
}