const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const multer = require('multer');
const path = require('path');

//Bring in Models
let Admin = require('../models/admin');
let Teacher = require('../models/teacher');
let Article = require('../models/article');
let Learner = require('../models/learner');
let Course = require('../models/course');
let Category = require('../models/category');

var ObjectId = require('mongoose').Types.ObjectId;
var modify = multer({ dest: './public/uploads/'});

//set public folder
router.use(express.static(path.join(__dirname, 'public')));

//Set Storage Engine-----
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//Init Upload-----
const upload = multer({
  storage : storage,
  limits: {fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

//Check File Type-----
function checkFileType(file, cb) {
  //Allow extension---
  const filetypes = /jpeg|jpg|png/;
  //check ext---
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime---
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

//Registration form
router.get('/register', function(req, res){
  res.render('learners/learner_register');
});

//Registration Process
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const type = 'learner';
  const password = req.body.password;
  const password2 = req.body.password2;
  const photo = null;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Name is required').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors:errors
    });
  } else {
    let newLearner = new Learner({
      name:name,
      email:email,
      username:username,
      type:type,
      password:password,
      photo:photo
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newLearner.password, salt, function(err, hash){
        if (err) {
          console.log(err);
        }
        newLearner.password = hash;
        newLearner.save(function(err){
          if (err) {
            console.log(err);
          } else {
            req.flash('success', 'You are now registered');
            res.redirect('/learners/login');
          }
        });
      });
    });
  }
});

//Login form
router.get('/login', function(req, res){
  res.render('learners/learner_login');
});

//Login process
router.post('/login', function(req, res, next){
  passport.authenticate('learner', {
    successRedirect:'/learners',
    failureRedirect:'/learners/login',
    failureFlash: true
  })(req, res, next);
});

//admin home route
router.get("/", function(req, res){
  if (!req.user) {
    res.render("learners/learner_login");
  } else {
    Teacher.find({}, function(err, teachers){
      Article.find({}, function(err, articles){
        Learner.find({}, function(err, learners){
          Course.find({}, function(err, courses){
            Category.find({}, function(err, categories){
              if (err) {
                console.log(err);
              }else {
                res.render("learners/learner_index", {
                  title: 'Courses',
                  user: req.user,
                  teachers: teachers,
                  articles: articles,
                  learners: learners,
                  courses: courses,
                  categories: categories
                });
              }
            });
          });
        });
      });
    });
  }
});

//Profile
router.get('/profile', function(req, res){
  if (!req.user) {
    res.render('learners/learner_login');
  } else {
    res.render('learners/learner_profile');
  }
});

// profile upload process-----
router.post('/upload', function(req, res){
  if (!req.user) {
    res.render('login');
  } else {
    upload(req, res, (err) => {
      if (err) {
        res.render('learners/learner_profile', {
          user: req.user,
          msg: err
        });
      } else {
        if (req.file == undefined) {
          res.render('learners/learner_profile', {
            user: req.user,
            msg: 'No File Selected !'
          });
        } else {
          res.render('learners/learner_profile', {
            user: req.user,
            msg: 'Photo Uploaded',
            file: '../'+`uploads/${req.file.filename}`
          });
        }
      }
    });
  }
});

//Modify Route
router.get('/modify', function(req, res){
  if (!req.user) {
    res.render('login');
  } else {
    res.render('learners/learner_modify');
  }
});

//Modify Route
router.post('/modify', modify.single('photo'), function(req, res){
  var update = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  };
  if(req.file) update.photo = '/uploads/' + req.file.filename;

  Learner.findByIdAndUpdate(ObjectId(req.user.id), { $set: update}, function (err, rtn){
    if (err) {
      res.render('learners/learner_profile', {
        user: req.user,
        msg: err
      });
    } else {
      res.render('learners/learner_profile', {
        user: req.user
      });
      // res.redirect('/users/view/'+rtn._id);
    }
  });
});

//Delete route
router.delete('/:id', function(req, res){

  let query = {_id:req.params.id}

  Learner.findById(req.params.id, function(err, learner){
      Learner.remove(query, function(err){
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
  });
});

//Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
