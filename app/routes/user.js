/**
 * User page routes
 */

var mongoose = require('mongoose');
var device = require('../helpers/device');

// DB models
var User = mongoose.model('User');
var Group = mongoose.model('Group');

exports.login = function (req, res) {

  var error = (req.param('wrong') !== undefined) ? true : false;

  if(req.isAuthenticated()) return res.redirect('/');

  res.render('user/login', {
      title  : 'Login',
      error  : error,
      mobile : device.isMobile(req),
      logged : false
  });
};

exports.signup = function (req, res) {

  if(req.isAuthenticated()) return res.redirect('/');

  res.render('user/signup', {
    title  : 'Sign up',
    user   : new User(),
    error  : null,
    mobile : device.isMobile(req),
    logged : false
  });

};

exports.create = function (req, res) {

  var user = new User(req.body);

  User.count({}, function (err, count) {

    if(count === 0) user.roles.admin = true;

    user.save(function (err) {
      if(err) {
        console.log(err);
        var error   = (err !== undefined) ? err.message : false,
            notfull = (err.errors) ? true : false;

        return res.render('user/signup', {
          title   : 'Sign up',
          error   : error,
          notfull : notfull,
          user    : user,
          mobile  : device.isMobile(req),
          logged  : false
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
  res.render('user/profile', {
    title  : 'Profile',
    user   : req.user,
    error  : null,
    mobile : device.isMobile(req),
    logged : true
  });
};

exports.update = function (req, res) {

  if(req.user.authenticate(req.body.oldpassword)) {

    if(req.body.username.length) {
      req.user.username = req.body.username;
    }

    req.user.password = req.body.oldpassword;

    if(req.body.password.length) {
      req.user.password = req.body.password;
    }

    req.user.save(function (err) {
      if(err) {
        console.log(err);

        var error = (err.message !== undefined) ? err.message : false;

        return res.render('user/profile', {
          title  : 'Profile',
          error  : error,
          user   : req.user,
          mobile : device.isMobile(req),
          logged : true
        });
      }

      req.logIn(req.user, function (err) {
        if(err) console.log(err);
        return res.redirect('/my');
      });

    });
  } else {
    return res.render('user/profile', {
      title  : 'Profile',
      user   : req.user,
      error  : 'Wrong current password',
      mobile : device.isMobile(req),
      logged : true
    });
  }

};

exports.selectGroup = function (req, res) {

  if(!req.isAuthenticated()) return res.redirect('/');

  Group
    .find({}, { name : 1 })
    .exec(function (err, groups) {
      if(err) console.log(err);

      return res.render('user/groupselect', {
        title      : 'Select your group',
        grouplist  : groups,
        curGroupId : '' + req.user.group,
        mobile     : device.isMobile(req),
        logged     : true
      });
    });
};

exports.addGroup = function (req, res) {

  User.update(
    { _id : req.user._id },
    { group : req.body.group },
    function (err) {
      if(err) console.log(err);
      return res.redirect('/my');
    }
  );
};
