const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
const flash = require('connect-flash');
const multer = require('multer');
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

var ObjectId = require('mongoose').Types.ObjectId;
//Category Model
let Category = require('../models/category');
let Course = require('../models/course');


const mongoURI = 'mongodb://localhost:27017/OnlineStudyICT';
router.use(methodOverride('_method'));

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const courseid = req.params.id;
        const filename = file.originalname;
         // + path.extname(file.originalname)
        const fileInfo = {
          aliases: courseid,
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });


//set public folder
router.use(express.static(path.join(__dirname, 'public')));

router.get("/", function(req, res){
  Course.find({}, function(err, courses){
    Category.find({}, function(err, categories){
      res.render("courses/course_index", {
        user: req.user,
        title: "Course Page",
        categories: categories,
        courses: courses
      });
    });
  });
});

//category route
router.get("/categories/:id", function(req, res){
  Category.findById(req.params.id, function(err, category){
    Course.find({category: category.cname}, function(err, courses){
      console.log(courses);
      res.render("category_index", {
        category: category,
        courses: courses
      })
    });
  });
});

router.get("/add", function(req, res){
  Category.find({}, function(err, categories){
    res.render("courses/course_add", {
      title: "Add Course",
      categories: categories
    });
  });
});

router.post('/add', function(req, res){
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Description is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('course_add', {
      user: req.user,
      title: 'Add Course',
      errors:errors
    });
  } else {
    let course = new Course();
    course.title = req.body.title;
    course.category = req.body.category;
    course.author = req.user._id;
    course.authname = req.user.name;
    course.description = req.body.body;

    course.save(function(err){
      if(err){
        console.log(err);
        return;
      }else {
        req.flash('success','Course Created');
        res.redirect('/courses');
      }
    });
  }
});

//add lesson route
router.get('/:id/addlesson', function(req, res){
  Course.findById(req.params.id, function(err, course){
    res.render('courses/course_addlesson', {
      course: course,
      user: req.user
    });
  });
});

//get single course
// router.get('/:id', function (req, res) {
//   // {filename: req.params.id}
//   gfs.files.find().toArray((err, files) => {
//     //Check if files
//     if(!files || files.length === 0){
//       Course.findById(req.params.id, function(err, course){
//         res.render('courses/course_detail', {
//           course: course,
//           lessons: course.lessons,
//           user: req.user
//         });
//       });
//     }else{
//       files.map(file => {
//          // || file.contentType === 'image/png'
//         if(file.contentType === 'video/mp4'){
//           file.isVideo = true;
//         }else{
//           file.isVideo = false;
//         }
//       });
//       Course.findById(req.params.id, function(err, course){
//         res.render('courses/course_detail', {
//           course: course,
//           lessons: course.lessons,
//           user: req.user,
//           files: files
//         });
//       });
//     }
//   });
//
//   Course.findById(req.params.id, function(err, course){
//     res.render('courses/course_detail', {
//       course: course,
//       lessons: course.lessons,
//       user: req.user
//     });
//   });
// });

//add lesson post route
router.post('/:id/addlessons', upload.single('file'), function(req, res){
  var courseid = req.params.id;
  var lessonnumber = req.body.number;
  var lessontitle = req.body.title;
  var lessonfile = req.body.file;
  req.checkBody('number', 'Number is required').notEmpty();
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('file', 'Video File is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if (errors) {
    Course.findById(req.params.id, function(err, course){
      res.render('courses/course_addlesson', {
        course: course,
        user: req.user,
        errors:errors
      });
    });
  } else {
    var lesson = {"lesson_number": lessonnumber, "lesson_title": lessontitle};
    Course.update({
        "_id": courseid
      },
      {
        $push:{
          "lessons": lesson
        }
      },
      function(err, doc){
        if(err){
          throw err;
        } else {
          req.flash('success', 'Lesson Added');
          res.redirect('/courses/'+courseid);
        }
      }
    );
  }
});

//add rating stars
router.post('/:id', function(req, res){
  var courseid = req.params.id;
  var username = "xyz";
  var ratedIndex = 3;
  // if (!req.user._id) {
  //   res.status(500).send();
  // }

  let query = {_id:req.params.id}

  Rating.findById(req.params.id, function(err, rating){
    // if (article.author != req.user._id) {
    //   res.status(500).send();
    // } else {
    var user = {"username":username, "userrating": ratedIndex};
    Rating.update({
        "_id": courseid
      },
      {
        $push:{
          "users": user,
          "totalstars": rating.totalstars
        }
      },
      function(err, doc){
        if(err){
          throw err;
        } else {
          req.flash('success', 'Rating Successful');
          res.redirect('/courses/'+courseid);
        }
      }
    );
    // }
  });
});

router.get('/videos/:filename', function(req, res){
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



module.exports = router;
