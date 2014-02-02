var mongoose = require('mongoose'),
    User     = mongoose.model('User'),
    device   = require('../helpers/device');

exports.login = function (req, res) {

  if(req.isAuthenticated())
    return res.redirect('/');

  var error = (req.param('wrong') !== undefined) ? true : false;

  res.render('users/login', {
      title  : 'Login',
      error  : error,
      mobile : device.isMobile(req)
  });
};

exports.signup = function (req, res) {

  if(req.isAuthenticated())
    return res.redirect('/');


  res.render('users/signup', {
    title     : 'Sign up',
    user      : new User(),
    error     : null,
    mobile    : device.isMobile(req)
  });

};

exports.create = function (req, res) {
  var user = new User(req.body);

  User.count({}, function (err, count) {

    if(count == 0)
      user.roles.admin = true;

    user.save(function (err) {
      if(err) {
        console.log(err);
        var error   = (err !== undefined) ? err.message : false,
            notfull = (err.errors) ? true : false;

        return res.render('users/signup', {
          title     : 'Sign up',
          error     : error,
          notfull   : notfull,
          user      : user,
          mobile    : device.isMobile(req)
        });
      }

      req.logIn(user, function (err) {
        if(err) console.log(err);
        return res.redirect('/u/group');
      });
    });

  });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.me = function (req, res) {
  res.render('users/profile', {
    title  : 'Edit your profile',
    user   : req.user,
    error  : null,
    mobile : device.isMobile(req)
  });
};

exports.update = function (req, res) {

  if(req.user.authenticate(req.body.oldpassword)) {

    if(req.body.username.length)
      req.user.username = req.body.username;

    req.user.password = req.body.oldpassword;

    if(req.body.password.length)
      req.user.password = req.body.password;

    req.user.save(function (err) {
      if(err) {
        console.log(err);

        var error   = (err !== undefined) ? err.message : false;

        return res.render('users/profile', {
          title     : 'Edit your profile',
          error     : error,
          user      : req.user,
          mobile    : device.isMobile(req)
        });
      }

      req.logIn(req.user, function (err) {
        if(err) console.log(err);
        return res.redirect('/');
      });

    });
  }
  else {
    return res.render('users/profile', {
      title  : 'Edit your profile',
      user   : req.user,
      error  : 'Wrong password',
      mobile : device.isMobile(req)
    });
  }

};

exports.selectGroup = function (req, res) {

  if(!req.isAuthenticated())
    return res.redirect('/');

  var Group = mongoose.model('Group');

  Group.find({}, { name : 1 })
       .sort({ name : 1 })
       .exec(function (err, groups) {
            if(err)
              console.log(err);

            return res.render('users/groupselect', {
              title      : 'Select your group',
              grouplist  : groups,
              curGroupId : '' + req.user.group,
              mobile     : device.isMobile(req)
            });
          }
       );
};

exports.addGroup = function (req, res) {

  var User = mongoose.model('User');

  User.update({ _id : req.user._id }, { group : req.body.group }, function (err) {
    if(err)
      console.log(err);

    return res.redirect('/')
  });
};