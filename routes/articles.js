const express = require('express');
const router = express.Router();

//Article Model
let Article = require('../models/article');
let Category = require('../models/category');
//Teacher Model
let Teacher = require('../models/teacher');

//edit single article
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
  Article.findById(req.params.id, function(err, article){
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized !');
      res.redirect('/');
    }
    res.render('edit_article', {
      title: 'Edit Article',
      article: article,
    });
  });
});

//teacher route
router.get("/add", ensureAuthenticated, function(req, res){
  Category.find({}, function(err, categories){
    res.render("add_article", {
      title: 'Add Articles',
      categories: categories
    });
  });
});

//category route
router.get('/category1', function(req, res){
  Article.find({category: 'network'}, function(err, articles){
    if(err){
      console.log(err);
    }else {
      res.render('category', {
        title: 'Network',
        articles: articles
      });
    }
  })
});
router.get('/category2', function(req, res){
  Article.find({category: 'programming'}, function(err, articles){
    if(err){
      console.log(err);
    }else {
      res.render('category', {
        title: 'Programming',
        articles: articles
      });
    }
  })
});
router.get('/category3', function(req, res){
  Article.find({category: 'combasic'}, function(err, articles){
    if(err){
      console.log(err);
    }else {
      res.render('category', {
        title: 'Computer Basic',
        articles: articles
      });
    }
  })
});

//add submit post route
router.post('/add', function(req, res){
  var title = req.body.title;
  var body = req.body.body;
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('add_article', {
      user: req.user,
      title: 'Add Article',
      errors:errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.category = req.body.category;
    article.author = req.user._id;
    article.authname = req.user.name;
    article.authpic = req.user.photo;
    article.body = req.body.body;
    article.date = Date("<dd-mm-YYYY>");

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      }else {
        req.flash('success','Article Added');
        res.redirect('/articles/blog');
      }
    });
  }
});

//add comment route
router.post('/:id/addcomment', function(req, res){
  var articleid = req.body.article_id;
  var articleauthor = req.body.article_author;
  var username = req.body.username;
  var commentbody = req.body.comment;

  req.checkBody('username', 'Username is required').notEmpty();

  //Get errors
  let errors = req.validationErrors();

  if (errors) {
    Article.findById(req.params.id, function(err, article){
      Teacher.findById(article.author, function(err, teacher){
        res.render('article', {
          errors: errors,
          user: req.user,
          article: article,
          author: teacher.name
        });
      });
    });
  } else {
    var comment = {"username":username, "body": commentbody};
    Article.update({
        "_id": articleid
      },
      {
        $push:{
          "comments": comment
        }
      },
      function(err, doc){
        if(err){
          throw err;
        } else {
          req.flash('success', 'Comment Successful');
          res.redirect('/articles/'+articleid);
        }
      }
    );
  }
});

//add like route
router.post('/:id/addlike', function(req, res){
  var articleid = req.body.article_id;
  var articleauthor = req.body.article_author;
  var username = req.body.username;

  //Get errors
  let errors = req.validationErrors();

  if (errors) {
    Article.findById(req.params.id, function(err, article){
      Teacher.findById(article.author, function(err, teacher){
        res.render('article', {
          errors: errors,
          user: req.user,
          article: article,
          author: teacher.name
        });
      });
    });
  } else {
    var like = {"username":username};
    Article.update({
        "_id": articleid
      },
      {
        $push:{
          "likes": like
        }
      },
      function(err, doc){
        if(err){
          throw err;
        } else {
          res.redirect('/articles/'+articleid);
        }
      }
    );
  }
});

//get blog route
router.get('/blog', function(req, res){
  if (!req.user) {
    Article.find({}, function(err, articles){
      if (err) {
        console.log(err);
      }else {
        Teacher.find(articles, function(err, teachers){
          articles = articles.reverse();
          res.render("blog", {
            title: 'Articles',
            articles: articles,
            teachers: teachers
          });
        });
      }
    });
  } else {
    let tipe = req.user.type;
    Article.find({}, function(err, articles){
      if (err) {
        console.log(err);
      }else {
        Teacher.find(articles, function(err, teachers){
          articles = articles.reverse();
          if (tipe == 'teacher') {
            res.render("blog", {
              articles: articles,
              teachers: teachers,
              type: 'teacher'
            });
          } else if (tipe == 'learner') {
            res.render("learners/learner_blog", {
              articles: articles,
              teachers: teachers,
              type: 'learner'
            });
          } else {
            res.render("blog", {
              articles: articles,
              teachers: teachers
            });
          }
        });
      }
    });
  }
});

//teacher courses route
router.get('/mycourses', function (req, res){
  res.send("This is teacher's courses page.")
});

//teacher articles route
router.get('/mycourse', function (req, res){
  if (!req.user) {
    res.render('login');
  } else {
    Article.find({author: req.user._id}, function(err, articles){
      res.render('teachers/teacher_mycourse', {
        title: 'My Articles!',
        articles: articles
      });
    });
  }
});

//get single article
router.get('/:id', function (req, res) {
  Article.findById(req.params.id, function(err, article){
    Teacher.findById(article.author, function(err, teacher){
      res.render('article', {
        article: article,
        author: teacher.name,
        type: teacher,
        comments: article.comments,
        likes: article.likes
      });
    });
  });
});

//update submit post route
router.post('/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.category = req.body.category;
  article.author = req.user._id;
  article.authname = req.user.name;
  article.authpic = req.user.photo;
  article.body = req.body.body;
  let query = {_id:req.params.id}
  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }else {
      req.flash('success', 'Article Updated');
      res.redirect('/');
    }
  });
});


//Delete route
router.delete('/:id', function(req, res){
  if (!req.user._id) {
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, function(err){
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

//Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    req.flash('danger', 'Please Login');
    res.redirect('/teachers/login');
  }
}

module.exports = router;
