var mongoose = require('mongoose'),
    week     = require('../models/week.js'),
    fs       = require('fs'),
    config   = require('../config/config')['development'],
    cache    = require('../helpers/cache')(fs, config.cache);

exports.getGroups = function (req, res) {

  cache.get(req.path,
    function (err, data) {
      if(err)
        console.log(err);

      res.json(data);
    },
    function (send) {
      var Group   = mongoose.model('Group');

      Group.getAll(function (err, groups) {
        if(err) {
          console.log(err);
          send({ error : { code : 500, msg : 'Unknown mistake' } }, 500);
        }
        else {
          send(groups);
        }
      });
    }
  );
};

exports.getTeachers = function (req, res) {

  cache.get(req.path,
    function (err, data) {
      if(err)
        console.log(err);

      res.json(data);
    },
    function (send) {
      var Teacher   = mongoose.model('Teacher');

      Teacher.getAll(function (err, teacher) {
        if(err) {
          console.log(err);
          send({ error : { code : 500, msg : 'Unknown mistake' } }, 500);
        }
        else {
          send(teacher);
        }
      });
    }
  );
};

exports.getSchedule = function (req, res) {

  var search = req.params.q,
      w      = req.param('w');


  if(search && (search.length > 0)) {

    search = search.replace(/_/g, ' ');

    var today = new Date();

    if(w !== undefined) {
      var i = 0;
      if(today.getStudyWeek() > (w + 35))
        i = 1;

      today = today.getDateOfISOWeek(w, today.getFullYear() + i);
    }
    else
      w = new Date().getStudyWeek();

    cache.get(req.path + w,
      function (err, data) {
        if(err)
          console.log(err);

        var err = parseInt(err, 10);
        if(err > 400)
          res.json(err, data);
        else
          res.json(data);
      },
      function (send) {
        var Group   = mongoose.model('Group'),
            Teacher = mongoose.model('Teacher');

        Group.findOne({ name : new RegExp(search, "i") }, function (err, group) {
          if(err) {
            console.log(err);
            send({ error : { code : 500, msg : 'Unknown mistake' }}, 500);
          }
          else {
            if(group)
              week.getSchedule(today, 'groups', group._id, function (err, data) {
                send(data);
              });
            else {
              Teacher.findOne({ name : new RegExp(search, "i") }, function (err, teacher) {
                if(err) {
                  console.log(err);
                  send({ error : { code : 500, msg : 'Unknown mistake' }}, 500);
                }
                else {
                  if(teacher)
                    week.getSchedule(today, 'teachers', teacher._id, function (err, data) {
                      send(data);
                    });
                  else
                    send({ error : { code : 404, msg : 'Not found' }}, 500);
                }

              });
            }
          }

        });
      }
    );
  }
  else {
    res.json(500, { error : { code : 500, msg :'Wrong request' }});
  }

};

exports.sendMsg = function (req, res) {

  var text = encodeURI(req.param('msg')),
      from = encodeURI(req.param('from'));

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

exports.getSubject = function (req, res) {

  var q = decodeURIComponent(req.params.q);

  if(q && q.length) {
    var Subject = mongoose.model('Subject');
    q = q.replace(/_/g, ' ');

    Subject.find({ name : new RegExp(q, 'i') },
                 { 'name'      : 1,
                   'groups'    : 1,
                   'teachers'  : 1,
                   'days'      : 1
                 })
           .populate('groups', 'name')
           .populate('teachers', 'name')
           .exec(function (err, subject) {
                    if(err)
                      console.log(err);

                    if(subject.length)
                      subject = subject[0];

                    return res.json(subject);
                 });
  }
  else
    return res.json(500, { error : 'Wrong request' });
};

exports.testCache = function (req, res) {

  //cache.clear();

  cache.get(req.path,
    function (err, data) {
      if(err)
        console.log(err);

      return res.json(data);
    },

    function () {
      var obj = { data : 'roman1', time : 0 };
      return obj;
    }
  );
}
