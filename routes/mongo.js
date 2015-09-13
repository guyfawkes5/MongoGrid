var express = require('express'),
    router = express.Router(),

    db = require('../db/mongo');

router.get('/schema', function(req, res) {
    db.getKeys().then(function(docs) {
        res.json(docs);
    });
});

module.exports = router;