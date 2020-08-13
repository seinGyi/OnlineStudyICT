const express = require ('express');
const ejs = require('ejs');
const path = require("path");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

mongoose.connect(config.database);
let conn = mongoose.connection;

let gfs;
//check connection
module.exports = conn.once('open', function(){
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('Connected to MongoDB');
})

//check for db errors
conn.on('error', function(err){
  console.log(err);
});

//init app
const app = express();

//Bring in Models
let Article = require('./models/article');
let Teacher = require('./models/teacher');
let Learner = require('./models/learner');
let Course = require('./models/course');
let Category = require('./models/category');

//setup ejs
app.engine('ejs', require('express-ejs-extend'));
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.set("view engine", 'ejs');

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false}))
//parse application/json
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

  while(namespace.length) {
    formParam += '[' + namespace.shift() + ']';
  }
  return {
    param : formParam,
    msg : msg,
    value : value
  };
}
}));

//Passport config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

//home route
app.get("/", function(req, res){
    Teacher.find({}, function(err, teachers){
      Article.find({}, function(err, articles){
        Learner.find({}, function(err, learners){
          Course.find({}, function(err, courses){
            Category.find({}, function(err, categories){
              if (err) {
                console.log(err);
              }else {
                res.render("index", {
                  title: 'Courses',
                  p: 'Sorry ! No Courses avilable !',
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
  });

//Route files
let articles = require('./routes/articles');
let teachers = require('./routes/teachers');
let learners = require('./routes/learners');
let courses = require('./routes/courses');
let admin = require('./routes/admin');
app.use('/articles', articles);
app.use('/teachers', teachers);
app.use('/learners', learners);
app.use('/courses', courses);
app.use('/admin', admin);

//About route
app.get("/about", function(req, res){
  res.render("about");
});

//get single course
app.get('/courses/:id', function (req, res) {
  // {filename: req.params.id}
  gfs.files.find({aliases: req.params.id}).toArray((err, files) => {
    //Check if files
    if(!files || files.length === 0){
      console.log('There is no video.');
      Course.findById(req.params.id, function(err, course){
        res.render('courses/course_detail', {
          course: course,
          // lessons: course.lessons,
          user: req.user,
          files: false
        });
      });
    }else{
      files.map(file => {
         // || file.contentType === 'image/png'
        if(file.contentType === 'video/mp4'){
          file.isVideo = true;
        }else{
          file.isVideo = false;
        }
      });
      console.log('There are videos.');
      console.log(files);
      Course.findById(req.params.id, function(err, course){
        res.render('courses/course_detail', {
          course: course,
          // lessons: course.lessons,
          user: req.user,
          files: files
        });
      });
    }
  });

  // Course.findById(req.params.id, function(err, course){
  //   res.render('courses/course_detail', {
  //     course: course,
  //     lessons: course.lessons,
  //     user: req.user
  //   });
  // });
});

app.get('/video/:filename', function(req, res){
  gfs.files.findOne({filename: req.params.filename}, function(req, file){
    //Check if file
    if(!file || file.length === 0){
      return res.status(404).json({
        err: 'No File exists'
      });
    }
    //check if file
    if(file.contentType === 'video/mp4' || file.contentType === 'video/ogg') {
      //read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    }else{
      res.status(404).json({
        err: 'Not an video'
      });
    }
  });
});

//get single course from courses.js
app.get('/c/:filename', function (req, res) {
  // {filename: req.params.id}
  console.log(req.params.filename);
  gfs.files.find({filename: req.params.filename}).toArray((err, files) => {
    console.log(req.params.id);
    //Check if files
    if(!files || files.length === 0){
      Course.findById(req.params.id, function(err, course){
        console.log("There is no file.");
        res.render('courses/course_detail', {
          course: course,
          // lessons: course.lessons,
          user: req.user,
          files: false
        });
      });
    }else{
      files.map(file => {
         // || file.contentType === 'image/png'
        if(file.contentType === 'video/mp4'){
          file.isVideo = true;
        }else{
          file.isVideo = false;
        }
      });
      console.log('There are files.');
      Course.findById(req.params.id, function(err, course){
        console.log('Sent the following files.');
        console.log(files);
        res.render('courses/course_detail', {
          course: course,
          lessons: course.lessons,
          user: req.user,
          files: files
        });
      });
    }
  });
});

//delete files
app.delete('/files/:id', function(req, res){
  gfs.remove({_id: req.params.id, root: 'uploads'}, function(err, gridStore){
    if(err){
      return res.status(404).json({ err: err });
    }
    res.redirect('/courses/'+req.body.courseid);
  });
});

//404 route
app.get("*", function(req, res){
  res.render("error", {
    title: '404'
  });
});

app.listen("3002", function(){
  console.log("Server is running on port: '3002'");
});
