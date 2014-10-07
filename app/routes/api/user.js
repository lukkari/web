/**
 * User(logged) API routes
 */

var
  mongoose = require('mongoose');

/**
 * DELETE '/api/user/subject/:id' Remove subject from user schedule
 */
exports.removeSubject = function (req, res) {
  var id = decodeURIComponent(req.params.id);

  if(!id || !id.length) return res.json(500, { error : 'Wrong request' });

  var UserTable = mongoose.model('UserTable');

  UserTable.findOneAndUpdate(
    { user : req.user._id },
    {
      $addToSet : { removed : id },
      $pull : { added : id },
      updatedAt : new Date()
    },

    function (err, doc) {
      if(err) console.log(err);

      if(!doc) {
        var userTable = new UserTable({
          user : req.user._id,
          removed : id
        });
        userTable.save(function (err) {
          if(err) {
            console.log(err);
            return res.json(500, { error : "Changes hasn't been saved" });
          }
          return res.send('success');
        });
      } else return res.send('success');
    }
  );
};

/**
 * POST '/api/user/subject/:id' Add subject to user schedule
 */
exports.addSubject = function (req, res) {
  var id = decodeURIComponent(req.params.id);

  if(!id || !id.length) return res.json(500, { error : 'Wrong request' });

  var UserTable = mongoose.model('UserTable');

  UserTable.findOneAndUpdate(
    { user : req.user._id },
    {
      $addToSet : { added : id },
      $pull : { removed : id },
      updatedAt : new Date()
    },

    function (err, doc) {
      if(err) console.log(err);

      if(!doc) {
        var userTable = new UserTable({
          user : req.user._id,
          added : id
        });
        userTable.save(function (err) {
          if(err) {
            console.log(err);
            return res.json(500, { error : "Changes hasn't been saved" });
          }
          return res.send('success');
        });
      } else return res.send('success');
    }
  );
};

/**
 * GET '/api/user/subject' Find subject by key
 */
exports.findSubject = function (req, res) {

  var key = decodeURIComponent(req.query.key);

  if(!key.length) return res.json(500, { error : 'Wrong request' });

  var Subject = mongoose.model('Subject');

  Subject
    .find({
        name : new RegExp(key, 'i')
      },
      { name : 1 })
    .lean()
    .limit(10)
    .sort('name')
    .exec(function (err, subjects) {
      if(err) console.log(err);

      res.json(subjects);
    });
};
