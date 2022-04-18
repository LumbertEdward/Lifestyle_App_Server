var express = require('express');
var router = express.Router();

router.get('/user', function (req, res) {
    res.send('respond with a resource');
})

module.exports = router;