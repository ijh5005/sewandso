let mongoose = require('mongoose');
var express = require('express');
var router = express.Router();


const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  userpassword: { type: String },
  firstname: String,
  lastname: String
});



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
