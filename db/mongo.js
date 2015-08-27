var Mongo = require('mongodb'),
    MongoClient = Mongo.MongoClient,
    Server = Mongo.Server,

    Q = require('q'),

    db, cn;

function map() {
    for (var key in this) {
        emit(key, null);
    }
}

function reduce(key, stuff) {
    return null;
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
    db.collection('exchanges').mapReduce(map, reduce, {out: {replace: 'schema_keys'}}).then(function(coll) {
        coll.find().toArray(function(err, docs) {
            console.log(docs);
        });
    });
    return {'x': 'y'};
}

module.exports = {
    connect: connect,
    getKeys: getKeys
};