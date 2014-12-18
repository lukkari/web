/**
 * User(logged) API routes
 */

var mongoose = require('mongoose');
var week = require('../../libs/week');
var weekday = require('../../libs/weekday');

// DB models
var UserTable = mongoose.model('UserTable');
var Subject = mongoose.model('Subject');
var Token = mongoose.model('Token');


/**
 * GET '/api/user/login' Login user
 */
exports.login = function (req, res) {
  var accessToken = new Token({
    user : req.user._id
  });

  accessToken.save(function (err, token) {
    if(err) console.log(err);

    var outUser = req.user.shortForm();
    outUser.accessToken = token.access;
    res.send(outUser);
  });
};

/**
 * GET '/api/user/schedule' Return user's schedule
 */
exports.getSchedule = function (req, res) {

  var w = req.param('w');
  var today = new Date();
  var i = 0;

  if(typeof w !== 'undefined') {
    // Return next year schedule for january,
    // when we are in August
    if(today.getStudyWeek() > 31 && w < 30) i = 1;
    today = today.getDateOfISOWeek(w, today.getFullYear() + i);
  } else w = today.getStudyWeek();

  UserTable
    .findOne({ user : req.user._id }, {
      added : 1,
      removed : 1
    })
    .exec(function (err, usertable) {
      if(err) console.log(err);

      week.getSchedule({
        date   : today,
        type   : 'groups',
        typeid : req.user.group,
        usertable : usertable,
        cb : function (err, data) {
          return res.json({
            title : 'My schedule',
            week : w,
            weekdays : data,
            url : 'my'
          });
        }
      });
    });
};

/**
 * GET '/api/user/schedule/now' Return user's now schedule
 */
exports.getNowSchedule = function (req, res) {

  var today = new Date();

  UserTable
    .findOne({ user : req.user._id }, {
      added : 1,
      removed : 1
    })
    .exec(function (err, usertable) {
      if(err) console.log(err);

      weekday.getSubjects({
          date   : today,
          type   : 'groups',
          typeid : req.user.group,
          usertable : usertable,
          cb : function (err, data) {
            var newdata = data;
            data.title = 'My schedule';
            data.url = 'my';
            res.json(newdata);
          }
        });
    });

};

/**
 * DELETE '/api/user/subject/:id' Remove subject from user schedule
 */
exports.removeSubject = function (req, res) {

  var id = decodeURIComponent(req.params.id);

  if(!id || !id.length) return res.status(500).send('Wrong request');

  UserTable.findOneAndUpdate(
    { user : req.user._id },
    {
      $addToSet : { removed : id },
      $pull : { added : id },
      updatedAt : new Date()
    },

    function (err, doc) {
      if(err) console.log(err);

      if(doc) return res.send('success');

      // If nothing found, create new userTable
      var userTable = new UserTable({
        user : req.user._id,
        removed : id
      });

      userTable.save(function (err) {
        if(err) {
          console.log(err);
          return res.status(500).send("Changes hasn't been saved");
        }
        return res.send('success');
      });
    }
  );
};

/**
 * POST '/api/user/subject/:id' Add subject to user schedule
 */
exports.addSubject = function (req, res) {

  var id = decodeURIComponent(req.params.id);

  if(!id || !id.length) return res.status(500).send('Wrong request');

  UserTable.findOneAndUpdate(
    { user : req.user._id },
    {
      $addToSet : { added : id },
      $pull : { removed : id },
      updatedAt : new Date()
    },

    function (err, doc) {
      if(err) console.log(err);

      if(doc) return res.send('success');

      // If nothing found, create new userTable
      var userTable = new UserTable({
        user : req.user._id,
        added : id
      });

      userTable.save(function (err) {
        if(err) {
          console.log(err);
          return res.status(500).send("Changes hasn't been saved");
        }
        return res.send('success');
      });
    }
  );
};

/**
 * GET '/api/user/subject' Find subject by key
 */
exports.findSubject = function (req, res) {

  var key = decodeURIComponent(req.query.key);

  if(!key.length) return res.status(400).send('Wrong request');

  Subject
    .find(
      { name : new RegExp(key, 'i') },
      { name : 1 })
    .lean()
    .limit(10)
    .sort('name')
    .exec(function (err, subjects) {
      if(err) console.log(err);
      res.json(subjects);
    });
};

/**
 * GET '/api/user/usertable' Return UserTable
 */
exports.getUserTable = function (req, res) {

  UserTable
    .findOne({ user : req.user._id }, { added : 1, removed : 1 })
    .populate('added', 'name')
    .populate('removed', 'name')
    .lean()
    .exec(function (err, usertable) {
      if(err) console.log(err);
      res.json(usertable);
    });
};

/**
 * DELETE '/api/user/usertable/:id' Remove subject from UserTable
 */
exports.removeFromUserTable = function (req, res) {

  var id = req.params.id;

  if(!id || !id.length) return res.status(400).send('Wrong request');

  UserTable.findOneAndUpdate(
    { 'user' : req.user.id },
    { $pull : { removed : id, added : id } },
    function (err, usertable) {
      if(err) console.log(err);
      res.send('success');
    }
  );

};
