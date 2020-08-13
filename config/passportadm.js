const LocalStrategy = require('passport-local').Strategy;
const Teacher = require('../models/teacher');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
  // Local Strategy
  passport.use(new LocalStrategy(function(username, password, done){
    //Match username
    let query = {username:username};
    Admin.findOne(query, function(err, admin){
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

  passport.serializeUser(function(admin, done) {
    done(null, admin.id);
  });

  passport.deserializeUser(function(id, done){
    Admin.findById(id, function(err, admin){
      done(err, admin);
    });
  });
}
