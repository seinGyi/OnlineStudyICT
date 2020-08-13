const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const multer = require('multer');
const path = require('path');

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

//Bring in Teacher Model
let Teacher = require('../models/teacher');
let Course = require('../models/course');

//Registration form
router.get('/register', function(req, res){
  res.render('register');
});

//Registration Process
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const type = 'teacher';
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
    let newTeacher = new Teacher({
      name:name,
      email:email,
      username:username,
      type:type,
      password:password,
      photo:photo
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newTeacher.password, salt, function(err, hash){
        if (err) {
          console.log(err);
        }
        newTeacher.password = hash;
        newTeacher.save(function(err){
          if (err) {
            console.log(err);
          } else {
            req.flash('success', 'You are now registered');
            res.redirect('/teachers/login');
          }
        });
      });
    });
  }
});

//Login form
router.get('/login', function(req, res){
  res.render('login');
});

//Login process
router.post('/login', function(req, res, next){
  passport.authenticate('teacher', {
    successRedirect:'/',
    failureRedirect:'/teachers/login',
    failureFlash: true
  })(req, res, next);
});

//Profile
router.get('/profile/:id', function(req, res){
  if (!req.user) {
    res.render('login');
  } else {

      Teacher.findById(req.params.id, function(err, teacher){
        Course.find({author: req.params.id}, function(err, courses){
          res.render('teachers/teacher_profile', {
            teacher: teacher,
            courses: courses
          });
        });
      });

  }
});

//Public Profile
router.get('/publicprofile/:id', function(req, res){
  Teacher.findById(req.params.id, function(err, teacher){
    Course.find({author: req.params.id}, function(err, courses){
      res.render('teachers/teacher_publicprofile', {
        teacher: teacher,
        courses: courses
      });
    });
  });
});

// profile upload process-----
router.post('/upload', function(req, res){
  if (!req.user) {
    res.render('login');
  } else {
    upload(req, res, (err) => {
      if (err) {
        res.render('teachers/teacher_profile', {
          user: req.user,
          msg: err
        });
      } else {
        if (req.file == undefined) {
          res.render('teachers/teacher_profile', {
            user: req.user,
            msg: 'No File Selected !'
          });
        } else {
          res.render('teachers/teacher_profile', {
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
router.get('/modify/:id', function(req, res){
  if (!req.user) {
    res.render('login');
  } else {
    res.render('teachers/teacher_modify');
  }
});

//Modify Route
router.post('/modify/:id', modify.single('photo'), function(req, res){
  var update = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  };
  if(req.file) update.photo = '/uploads/' + req.file.filename;

  Teacher.findByIdAndUpdate(ObjectId(req.user.id), { $set: update}, function (err, rtn){
    if (err) {
      res.render('teachers/teacher_profile', {
        user: req.user,
        msg: err
      });
    } else {
      Teacher.findById(req.params.id, function(err, teacher){
        Course.find({author: req.params.id}, function(err, courses){
          res.render('teachers/teacher_profile', {
            user: req.user,
            teacher: teacher,
            courses: courses
          });
        });
      });
      // res.redirect('/users/view/'+rtn._id);
    }
  });
});

//Delete route
router.delete('/:id', function(req, res){
  let query = {_id:req.params.id}
  Teacher.findById(req.params.id, function(err, teacher){
      Teacher.remove(query, function(err){
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
