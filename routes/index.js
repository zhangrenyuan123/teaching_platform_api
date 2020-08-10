var express = require('express');
var router = express.Router();
const connection = require('../config/connect_mysql');
// let { usersModel } = require('../config/models/usersModel');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('teaching_platform项目api');
});

module.exports = router;