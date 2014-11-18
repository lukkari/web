/**
 * User(logged) API routes
 */

var mongoose = require('mongoose');

// DB models
var UserTable = mongoose.model('UserTable');
var Subject = mongoose.model('Subject');

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
