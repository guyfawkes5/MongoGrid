var Mongo = require('mongodb'),
    MongoClient = Mongo.MongoClient,
    Server = Mongo.Server,

    Q = require('q'),

    db, cn;

function connect(url) {
    var connected = Q.defer();
    MongoClient.connect(url, function(err, db) {
        if (!err) {
            connected.resolve(db);
        } else {
            connected.reject(err);
        }
    });
    return connected.promise;
}

function getKeys() {
    return {x: 'y'};
    /*MongoClient.command({
     'mapreduce': coll.collectionName,
     'map': function() {
     for (var key in this) { emit(key, null); }
     },
     "reduce" : function(key, stuff) { return null; },
     "out": "my_collection" + "_keys"
     });*/
}

module.exports = {
    connect: connect,
    getKeys: getKeys
};