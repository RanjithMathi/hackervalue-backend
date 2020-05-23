var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Questions = require("../models/book");
var Tests = require("../models/test");
var random = require('mongoose-random');
var json2xls = require('json2xls');
var url = require('url');


router.post('/signup', function(req, res) {
  console.log("req===="+req.json);
  console.log("stringify",JSON.stringify(req.body));
  if (!req.body.username || !req.body.password) {
    console.log("req===="+req.body.json);
    console.log("req====");
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    console.log("req===45="+req.body);
    console.log("req===67=");
    var newUser = new User({
      name:req.body.name,
      username: req.body.username,
      password: req.body.password,
      email : req.body.email,
      role:req.body.role,
      department:req.body.department,
      college:req.body.college,
      phno:req.body.phno,
      mark:req.body.mark

    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        console.log("error==>"+err)
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

router.post('/signin', function(req, res) {
  console.log("stringify",JSON.stringify(req.body));
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token,username: user.username,role: user.role});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

router.post('/markToUser', function(req, res) {
  console.log(req.body.mark)
  console.log(req.body.username)
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // update marks to same user
      user.mark= req.body.mark;
      
      // user.email=req.body.email;
      user.save(function(err) {
        if (err) {
          console.log("error",err)
          return res.json({success: false, msg: 'Mark not exists.'});
        }
        res.json({success: true, msg: 'Successful updated mark.'});
      });
    }
  });
});

router.post('/findbyUserId', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    res.json(user);
    console.log("user--:",user);
  });

//  // Use the assert model to find a specific beer
//  Questions.findById(req.params._id, function (err, student) {
//   if (err)
//     res.send(err);
//   // Update the existing assert quantity
//   console.log(student);
  // Save the assert and check for errors
 

});

router.post('/findbyCollege', function(req, res) {
  console.log("req:",req.body);
var query = User.find({ 'college': req.body.college,'department':req.body.department });

// selecting the `name` and `occupation` fields
query.select('username mark');

// execute the query at a later time
query.exec(function (err, user) {
  if (err) return handleError(err);
  res.json(user);
  // Prints "Space Ghost is a talk show host."
  console.log('%s s a %s.', user.username, user.mark,);
});

});
 

router.post('/insertDetails', function(req, res) {
 
    console.log(req.body);
    var questions = new Questions({
      quizTitle: req.body.quizTitle,
      duration: req.body.duration,
      questions: req.body.questions,
      questionLines: req.body.questionLines,
      answer: req.body.answer,
      choices:req.body.choices
    });

    questions.save(function(err) {
      if (err) {
        console.log(err);
        return res.json({success: false, msg: 'Save book failed.'});
      }
      res.json({success: true, msg: 'Successful created new book.'});
    });
});

router.get('/write', function(req, res) {
  writeExcel();
});

router.get('/getDetails', function(req, res) {
  // writeExcel();
  // passport.authenticate('jwt', { session: false}),
  // var token = getToken(req.headers);
  // if (token) {
    Questions.find(function (err, questions) {
      if (err) return next(err);
      res.json(questions);
      console.log(questions);
    });
  // } else {
  //   return res.status(403).send({success: false, msg: 'Unauthorized.'});
  // }
});

router.get('/allUsers', function(req, res) {
  // passport.authenticate('jwt', { session: false}),
  // var token = getToken(req.headers);
  // if (token) {
    User.find(function (err, users) {
      if (err) return next(err);
      res.json(users);
      console.log(users);
    });
  // } else {
  //   return res.status(403).send({success: false, msg: 'Unauthorized.'});
  // }
});

router.get('/getRandom', function(req, res) {
Questions.findRandom().limit().exec(function (err, questions) {
  if (err) return next(err);
  res.json(questions);
  console.log(questions);

    // Questions.syncRandom(function (err, result) {
    //   console.log("updated===>",result.updated.get);
    // });

  });
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

router.post('/addTest', function(req, res) {
  console.log("test add : ",req.body);
    var tests = new Tests({
      name:req.body.name,
  createdBy:req.body.createdBy,
  createdDate:req.body.createdDate,
    });

    tests.save(function(err) {
      if (err) {
        console.log(err);
        return res.json({success: false, msg: 'Test add failed.'});
      }
      res.json({success: true, msg: 'Successful created new Test.'});
    });

});


router.get('/getAllTest', function(req, res) {
  Tests.find(function (err, tests) {
    if (err) return next(err);
    res.json(tests);
    console.log(tests);
  });

});


router.get('/questionsByTestName', function(req, res) {
  // var query = { quizTitle: "test1" };
  var query = url.parse(req.url,true).query;
  console.log(query);
    Questions.find(query, function (err, questions) {
      if (err) return next(err);
      res.json(questions);
    });
});

module.exports = router;

