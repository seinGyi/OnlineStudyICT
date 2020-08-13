const LocalStrategy = require('passport-local').Strategy;
const Teacher = require('../models/teacher');
const Learner = require('../models/learner');
const Admin = require('../models/admin');
const config = require('../config/database');
const bcrypt = require('bcryptjs');


module.exports = function(passport){
  passport.use('admin' , new LocalStrategy(function(username, password, done){
    //Match username
    let query = {username:username};
    Admin.findOne(query, function(err, admin){
      console.log(query);
      if(err) throw err;
      if(!admin){
        return done(null, false, {message: 'No Admin Found'});
      }

      //Match Password
      bcrypt.compare(password, admin.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, admin);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
    });
  }));

  passport.use('teacher' , new LocalStrategy(function(username, password, done){
    //Match username
    let query = {username:username};
    Teacher.findOne(query, function(err, teacher){
      if(err) throw err;
      if(!teacher){
        return done(null, false, {message: 'No Teacher Found'});
      }

      //Match Password
      bcrypt.compare(password, teacher.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, teacher);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
    });
  }));

  passport.use('learner' , new LocalStrategy(function(username, password, done){
    //Match username
    let query = {username:username};
    Learner.findOne(query, function(err, learner){
      if(err) throw err;
      if(!learner){
        return done(null, false, {message: 'No Learner Found'});
      }

      //Match Password
      bcrypt.compare(password, learner.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, learner);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
    });
  }));

    passport.serializeUser(function(entity, done) {
      done(null, { id: entity.id, type: entity.type });
    });

    passport.deserializeUser(function(obj, done){
      switch (obj.type) {
        case 'teacher':
          Teacher.findById(obj.id, function(err, teacher){
            done(err, teacher);
          });
          break;
        case 'learner':
          Learner.findById(obj.id, function(err, learner){
            done(err, learner);
          });
          break;
        case 'admin':
          Admin.findById(obj.id, function(err, admin){
            done(err, admin);
          });
          break;
        default:
          done(new Error('no entity type:', obj.type), null);
          break;
      }
    });
}
