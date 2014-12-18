var
  mongoose      = require('mongoose'),
  LocalStrategy = require('passport-local').Strategy,
  BasicStrategy = require('passport-http').BasicStrategy,
  User          = mongoose.model('User');

module.exports = function (passport) {

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

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
   * HTTP basic authorization
   */
  passport.use(new BasicStrategy(
    function (username, password, done) {
      User.findOne({ username : username }, function (err, user) {
        if(err) return done(err);
        if(!user) return done(null, false);
        if(!user.authenticate(password)) {
          return done(null, false);
        }

        return done(null, user);
      });
    }
  ));

};
