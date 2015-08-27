var express = require('express'),
    router = express.Router(),

    db = require('../db/mongo');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/mongo/schema', function(req, res) {
    res.json(db.getKeys());
});

module.exports = router;
