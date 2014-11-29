/**
 * Authorization config
 */

var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = mongoose.model('User');
var config = require('./config');

module.exports = function (app, passport) {

  config = config[app.get('env')];

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  /**
   * Local authorization
   */
  passport.use(new LocalStrategy(
    function (username, password, done) {
      User.findOne({ username : username }, function (err, user) {
        if(err) return done(err);
        if(!user) return done(null, false, { message : 'Unknown user' });
        if(!user.authenticate(password)) {
          return done(null, false, { message : 'Invalid password' });
        }

        return done(null, user);
      });
    }
  ));

  /**
   * Google authorization
   */
  passport.use(new GoogleStrategy({
      clientID : config.API.google.CLIENT_ID,
      clientSecret : config.API.google.CLIENT_SECRET,
      callbackURL : config.app.url + "/u/auth/google/callback",
      passReqToCallback : true,
      scope : ['email', 'https://www.googleapis.com/auth/calendar']
    },
    function (req, accessToken, refreshToken, profile, done) {

      var user = req.user;
      if(!user) {
        return done(new Error('User is not authorized'));
      }

      user.save(function (err) {
        return done(err, user);
      });
    }
  ));

};
