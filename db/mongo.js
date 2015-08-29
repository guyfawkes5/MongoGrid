var Mongo = require('mongodb'),
    MongoClient = Mongo.MongoClient,

    Q = require('q'),

    db;

module.exports = {
    connect: connect,
    getKeys: getKeys
};

function map() {
    function isObject(value) {
        return value === Object(value) && !Array.isArray(value) && value.constructor.name !== 'BinData';
    }

    function getNestedKeys(object, prefix, original) {
        var ret = original || {};

        prefix = (prefix ? prefix + '$' : '');

        if (isObject(object)) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var value = object[key],
                        builtKey = prefix + key;

                    ret[builtKey] = null;
                    if (isObject(value)) {
                        getNestedKeys(value, builtKey, ret);
                    }
                }
            }
        }
        return ret;
    }

    for (var key in this) {
        emit(key, getNestedKeys(this[key]));
    }
}

function reduce(key, values) {
    var reduced = {};

    for (var i = 0; i < values.length - 1; i++) {
        var value = values[i];

        for (var key in value) {
            if (reduced[key]) {
                reduced[key]++;
            } else {
                reduced[key] = 1;
            }
        }
    }
    reduced.$total = values.length;

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
                gotKeys.resolve(docs);
            } else {
                gotKeys.reject(err);
            }
        });
    });
    return gotKeys.promise;
}