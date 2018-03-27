////////// Express Js NOTES ////////

//var express = require('express');
//var router = express.Router();
//var mongoose = require('mongoose');

//http requests
router.get(url, callback);    // ex: router.get("/myInfo", () => { res.send("OK") );
router.post(url, callback);   // ex: router.post("/myInfo", () => { res.send("OK") );
router.delete(url, callback); // ex: router.delete("/myInfo", () => { res.send("OK") );
router.put(url, callback);    // ex: router.put("/myInfo", () => { res.send("OK") );

//get params in the link
req.params                    //ex: req.params.name
//get the body sent in the request
req.body                      //ex: req.body.icecreamChoice
//get the header send in the request -> headers are more secure then the url or body way of sending data as long as you encrypt it first (headers are support for all http request, body is not always support so send information in the header)
req.headers                   //ex: var header = req.headers;

//send content to the page
res.send()                    //res.send("Hi")
//send a status code -> code = ex: 404, 200, 500
res.status(code).send()       //res.status(200).send()


//query strings -> ex: http://localhost:3000/likes?id=2&name=isaiah
//used to get info out of query strings (advantage: doesn't have to be in any order in the url)
req.query                   //req.query.id = 2


////////// MongoDB NOTES ////////
//var mongoose = require('mongoose');

//connect to the database
mongoose.connect(databaseUrl);  // ex: mongoose.connect('mongodb://<dbuser>:<dbpassword>@ds147274.mlab.com:47274/database092317');
//define a schema -> a schema is the type of object to expect with the keys and the value types defined
const mySchema = mongoose.Schema({    // ex: const mySchema = mongoose.Schema({
  key: type,                          //        username: String,
});                                   //     });
//model the schema to create an instance of it
const userProfile = mongoose.model(collectionName, SchemaName)  // ex: const userProfile = mongoose.model('profile', mySchema);
//set the key just like an object
userProfile.key = value;              // ex: newProfile.username = name;
userProfile.save(callback(err, savedObj)) // save the data afterwards
                                          //  userProfile.save((err, obj) => {
                                          //    if(err){
                                          //      console.log(err);
                                          //      res.status(500).send();
                                          //    } else {
                                          //      res.send(obj);
                                          //    }
                                          //  });
userProfile.find({config}, callback(err, foundObj))   // find data -> this finds everything if there is no config
                                                      //  userProfile.find({}, (err, obj) => {
                                                      //    if(err){
                                                      //      console.log(err);
                                                      //      res.status(500).send();
                                                      //    } else {
                                                      //      res.send(obj);
                                                      //    }
                                                      //  });
userProfile.findOne({config}, callback(err, foundObj))  // ex: example #2 below
userProfile.findOneAndRemove({config}, callback(err))   // ex: example #3 below

ex:
//////////
http request in postman as a post: http://localhost:3000/userinfo?username=isaiah&password=12345678
output: {
            "__v": 0,
            "password": 12345678,
            "username": "isaiah",
            "_id": "59c6d0bae09f327355712ee0"
        }
//////////
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('mongodb://user:password@ds147274.mlab.com:47274/database092317');

const mySchema = mongoose.Schema({
  username: String,
  password: Number,
});

const userProfile = mongoose.model('profile', mySchema);

//sumbit user information
router.post('/userinfo', (req, res, next) => {
  let newProfile = new userProfile();
  const name = req.query.username;
  const password = req.query.password;

  newProfile.username = name;
  newProfile.password = password;

  newProfile.save((err, obj) => {
    if(err){
      console.log(err);
      res.status(500).send();
    } else {
      res.send(obj);
    }
  });
});

ex#2:
//////////
http request in postman as a put: http://http://localhost:3000/update?id=59c6d0bae09f327355712ee0&username=ijh5005
output: {
            "_id": "59c6d0bae09f327355712ee0",
            "password": 12345678,
            "username": "ijh5005",
            "__v": 0
        }
//////////

//update the user information
router.put('/update', (req, res, next) => {
  const name = req.query.username;
  const id = req.query.id;

  userProfile.findOne({_id: id}, (err, obj) => {
    //update the information if the information is given in the url
    if(name){
      if(err){
        console.log(err);
        res.status(500).send();
      } else {
        obj.username = name;
        obj.save((err, object) => {
          if(err){
            console.log(err);
            res.status(500).send();
          } else {
            res.send(object);
          }
        });
      }
    }

  }); // end: userProfile.findOne

});

ex#3:
http request in postman as a delete: http://http://localhost:3000/delete?id=59c6d0bae09f327355712ee0

router.delete('/deleteaccount', (req, res, next) => {
  const id = req.query.id;
  userProfile.findOneAndRemove({_id: id}, (err) => {
    if(err){
      console.log(err);
      return res.status(500).send();
    }

    return res.status(200).send();

  });
});
