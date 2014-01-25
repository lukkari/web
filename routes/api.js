var mongoose = require('mongoose');

var week = require('../models/week.js');

exports.getGroups = function (req, res) {
  var Group   = mongoose.model('Group');

  Group.getAll(function (err, group) {
    if(err) {
      console.log(err);
      res.json(500, {error : { code : 500, msg : 'Unknown mistake' }});
    }
    else {
      res.json(group);
    }
  });
};

exports.getTeachers = function (req, res) {
  var Teacher   = mongoose.model('Teacher');

  Teacher.getAll(function (err, teacher) {
    if(err) {
      console.log(err);
      res.json(500, {error : { code : 500, msg : 'Unknown mistake' }});
    }
    else {
      res.json(teacher);
    }
  });
};

exports.getSchedule = function (req, res) {

  var uri = req.params[0];

  if(uri && (uri.length > 0)) {

    uri = uri.split('/');

    var w,
        search;

    uri.forEach(function (el) {
      if(el.match(/w[0-9]+/ig))
        w = el.substr(1);
    });
    uri = uri.join('');

    if(w)
      uri = uri.replace('w' + w, '');

    search = uri.replace(/_/g, ' ');

    var today = new Date();

    if(w !== undefined) {
      var i = 0;
      if(today.getStudyWeek() > (w + 35))
        i = 1;

      today = today.getDateOfISOWeek(w, today.getFullYear() + i);
    }

    var Group   = mongoose.model('Group'),
        Teacher = mongoose.model('Teacher');

    Group.findOne({ name : new RegExp(search, "i") }, function (err, group) {
      if(err) {
        console.log(err);
        res.json(500, { error : { code : 500, msg : 'Unknown mistake' }});
      }
      else {
        if(group)
          week.getSchedule(today, 'groups', group._id, function (err, data) {
            res.json(data);
          });
        else {
          Teacher.findOne({ name : new RegExp(search, "i") }, function (err, teacher) {
            if(err) {
              console.log(err);
              res.json(500, { error : { code : 500, msg : 'Unknown mistake' }});
            }
            else {
              if(teacher)
                week.getSchedule(today, 'teachers', teacher._id, function (err, data) {
                  res.json(data);
                });
              else
                res.json({ error : { code : 404, msg : 'Not found' }});
            }

          });
        }
      }

    });
  }
  else {
    res.json(500, { error : { code : 500, msg :'Wrong request' }});
  }

};

exports.sendMsg = function (req, res) {

  var text    = encodeURI(req.param('msg')),
      from    = encodeURI(req.param('from'));

  if(text.length < 2)
    res.json(200, 'success');
  else {

    var Contact = mongoose.model('Contact'),
        contact = new Contact({ message : text, from : from });

    contact.save(function (err) {
      if(err) {
        console.log(err);
        res.json(500, 'error');
      }
      else
        res.json(200, 'success');
    });
  }
};