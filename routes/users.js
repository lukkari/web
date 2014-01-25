var mongoose = require('mongoose'),
    User     = mongoose.model('User');

exports.init = function (req, res) {

  if(req.isAuthenticated())
    res.redirect('/');

  res.render('users/login', {
      title : 'Login',
      error : null
  });
};

exports.signup = function (req, res) {

  if(req.isAuthenticated())
    res.redirect('/');

  var Group = mongoose.model('Group');

  Group.find({}, { name : 1 })
       .sort({ name : 1 })
       .exec(function (err, groups) {
          if(err)
            console.log(err);

          res.render('users/signup', {
              title     : 'Sign up',
              grouplist : groups,
              user      : new User()
          });
       }
  );
};

exports.create = function (req, res) {
  var user = new User(req.body);

  User.count({}, function (err, count) {

    if(count == 0)
      user.roles.admin = true;

    user.save(function (err) {
      if(err) {
        return res.render('users/signup', {
          title     : 'Sign up',
          error     : err.errors,
          grouplist : [],
          user      : user
        });
      }

      req.logIn(user, function (err) {
        if(err) next(err);
        return res.redirect('/');
      });
    });

  });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.me = function (req, res) {
  res.json('success');
};