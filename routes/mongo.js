var express = require('express'),
    router = express.Router(),

    db = require('../db/mongo');

router.get('/schema', function(req, res) {
    db.getKeys().then(function(docs) {
        res.json(docs);
    });
});

router.get('/:resource', function(req, res) {
   db.get({
       name: req.params.resource,
       value: req.query.value
   }).then(function(docs) {
       res.json(docs);
   });
});

module.exports = router;