const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const path = require("path");

//Bring in Models
let Admin = require('../models/admin');
let Teacher = require('../models/teacher');
let Learner = require('../models/learner');
let Article = require('../models/article');
let Category = require('../models/category');

//set public folder
router.use(express.static(path.join(__dirname, 'public')));

//admin login route
router.get("/signup", function(req, res){
  res.render("admin/admin_signup", {
    title: 'Signup for Admin'
  })
});

//Registration Process
router.post('/signup', function(req, res){
  const username = req.body.username;
  const type = 'admin';
  const password = req.body.password;

  req.checkBody('username', 'Name is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    res.render('admin/admin_signup', {
      errors:errors
    });
  } else {
    let newAdmin = new Admin({
      username:username,
      type:type,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newAdmin.password, salt, function(err, hash){
        if (err) {
          console.log(err);
        }
        newAdmin.password = hash;
        newAdmin.save(function(err){
          if (err) {
            console.log(err);
          } else {
            req.flash('success', 'Now ! You are Admin');
            res.redirect('/admin/login');
          }
        });
      });
    });
  }
});

//admin login route
router.get('/login', function(req, res){
  res.render("admin/admin_login", {
    title: 'Login for Admin'
  })
});

//admin login process
router.post('/login', function(req, res, next){
  passport.authenticate('admin', {
    successRedirect:'/admin',
    failureRedirect:'/admin/login',
    failureFlash: true
  })(req, res, next);
});

//admin home route
router.get("/", function(req, res){
  if (!req.user) {
    res.render("admin/admin_index");
  } else {
    Teacher.find({}, function(err, teachers){
      Article.find({}, function(err, articles){
        Learner.find({}, function(err, learners){
          if (err) {
            console.log(err);
          }else {
            res.render("admin/admin_index", {
              user: req.user,
              teachers: teachers,
              learners: learners,
              articles: articles
            });
          }
        });
      });
    });
  }
});

router.get("/adding", function(req, res){
  Category.find({}, function(err, categories){
    res.render("admin/admin_adding", {
      title: "Add Category",
      categories: categories
    });
  });
});

//add category post route
router.post('/addcategory', function(req, res){
  req.checkBody('ctitle', 'Name is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if (errors) {
    console.log("Fail to add");
    Category.find({}, function(err, categories){
      res.render("admin/admin_adding", {
        user: req.user,
        title: "Add Category",
        categories: categories
      });
    });
  } else {
    let category = new Category();
    category.cname = req.body.ctitle;

    category.save(function(err){
      if(err){
        console.log(err);
        return;
      }else {
        req.flash('success','Category Added');
        res.redirect('/admin/adding');
      }
    });
  }
});

//admin login route
router.get('/dashboard', function(req, res){
  res.send('dashboard test');
});

//Delete route
router.delete('/:id', function(req, res){

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
      Article.remove(query, function(err){
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
  res.redirect('/admin/login');
});

module.exports = router;
