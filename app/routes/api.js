var mongoose = require('mongoose'),
    week     = require('../helpers/models/week'),
    weekday  = require('../helpers/models/weekday'),
    config   = require('../config/config'),
    cache    = require('../helpers/cache')(config.cache);

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
          send({ error : { code : 400, msg : 'Unknown mistake' } }, 400);
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
          send({ error : { code : 400, msg : 'Unknown mistake' } }, 400);
        }
        else {
          send(teacher);
        }
      });
    }
  );
};

exports.getRooms = function (req, res) {
  cache.get(req.path,
    function (err, data) {
      if(err)
        console.log(err);

      res.json(data);
    },
    function (send) {
      var Room   = mongoose.model('Room');

      Room.getAll(function (err, room) {
        if(err) {
          console.log(err);
          send({ error : { code : 400, msg : 'Unknown mistake' } }, 400);
        }
        else {
          send(room);
        }
      });
    }
  );
};

exports.getNow = function (req, res) {

  var search = req.params.q;

  if(!search || !search.length) return res.json(400, { error : { code : 500, msg :'Wrong request' }});

  var today = new Date();
  search = search.replace(/_/g, ' ').replace(/ *\([^)]*\) */g, '').trim();

  if(search.toLowerCase() === 'my') {

    if(!req.isAuthenticated()) return res.json(404, { error : { code : 404, msg : 'Not found' }});

    var UserTable = mongoose.model('UserTable');

    UserTable.findOne({ user : req.user._id }, function (err, data) {
      if(err) console.log(err);

      weekday.getSubjects({
        date   : today,
        type   : 'groups',
        typeid : req.user.group,
        usertable : data,
        cb : function (err, data) {
          return res.json(data);
        }
      });
    });

    return;
  }

  cache.get(req.path,
    function (err, data) {
      if(err)
        console.log(err);

      err = parseInt(err, 10);
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
          send({ error : { code : 400, msg : 'Unknown mistake' }}, 400);
        }
        else {
          if(group)
            weekday.getSubjects({
              date   : today,
              type   : 'groups',
              typeid : group._id,
              cb : function (err, data) {
                send(data);
              }
            });
          else {
            Teacher.findOne({ name : new RegExp(search, "i") }, function (err, teacher) {
              if(err) {
                console.log(err);
                send({ error : { code : 400, msg : 'Unknown mistake' }}, 400);
              }
              else {
                if(teacher)
                  weekday.getSubjects({
                    date   : today,
                    type   : 'teachers',
                    typeid : teacher._id,
                    cb : function (err, data) {
                      send(data);
                    }
                  });
                else
                  send({ error : { code : 404, msg : 'Not found' }}, 404);
              }

            });
          }
        }

      });
    }
  );
};

exports.getSchedule = function (req, res) {

  var search = req.params.q,
      w      = req.param('w');


  if(!search || !search.length) return res.json(400, { error : { code : 400, msg :'Wrong request' }});

  search = search.replace(/_/g, ' ').replace(/ *\([^)]*\) */g, '').trim();
  var today = new Date();

  if(w !== undefined) {
    var i = 0;
    if(today.getStudyWeek() > (w + 35))
      i = 1;

    today = today.getDateOfISOWeek(w, today.getFullYear() + i);
  }
  else
    w = new Date().getStudyWeek();

  if(search.toLowerCase() === 'my') {

    if(!req.isAuthenticated()) return res.json(404, { error : { code : 404, msg : 'Not found' }});

    var UserTable = mongoose.model('UserTable');

    UserTable.findOne({ user : req.user._id }, function (err, data) {
      if(err) console.log(err);

      week.getSchedule({
        date   : today,
        type   : 'groups',
        typeid : req.user.group,
        usertable : data,
        cb : function (err, data) {
          return res.json({ title : 'My schedule', weekdays : data });
        }
      });
    });

    return;
  }

  cache.get(req.path + w,
    function (err, data) {
      if(err)
        console.log(err);

      err = parseInt(err, 10);
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
          send({ error : { code : 400, msg : 'Unknown mistake' }}, 400);
        }
        else {
          if(group)
            week.getSchedule({
              date   : today,
              type   : 'groups',
              typeid : group._id,
              cb : function (err, data) {
                send({ title : group.name, weekdays : data });
              }
            });
          else {
            Teacher.findOne({ name : new RegExp(search, "i") }, function (err, teacher) {
              if(err) {
                console.log(err);
                send({ error : { code : 400, msg : 'Unknown mistake' }}, 400);
              }
              else {
                if(teacher)
                  week.getSchedule({
                    date   : today,
                    type   : 'teachers',
                    typeid : teacher._id,
                    cb : function (err, data) {
                      send({ title : teacher.name, weekdays : data });
                    }
                  });
                else
                  send({ error : { code : 404, msg : 'Not found' }}, 404);
              }

            });
          }
        }

      });
    }
  );

};

exports.sendMsg = function (req, res) {

  var text = encodeURI(req.param('msg')),
      from = encodeURI(req.param('from'));

  if(text.length < 2)
    return res.json('success');

  var Contact = mongoose.model('Contact'),
      contact = new Contact({ message : text, from : from });

  contact.save(function (err) {
    if(err) {
      console.log(err);
      res.json(400, 'error');
    }
    else res.json('success');
  });

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
                    if(err) console.log(err);
                    if(subject.length) subject = subject[0];
                    return res.json(subject);
                 });
  }
  else
    return res.json(400, { error : 'Wrong request' });
};

exports.getSubjects = function (req, res) {
  var q = decodeURIComponent(req.params.q);

  if(q && q.length) {
    var Subject = mongoose.model('Subject');
    q = q.replace(/_/g, ' ');

    Subject.find({ name : new RegExp(q, 'i') },
                 { 'name' : 1 })
           .limit(20)
           .exec(function (err, subjects) {
                    if(err) console.log(err);
                    return res.json({ data : subjects });
                 });
  }
  else
    return res.json(400, { error : 'Wrong request' });
};

exports.removeSubject = function (req, res) {

  var q = decodeURIComponent(req.params.q);

  if(!q || !q.length) return res.json(400, 'wrong request');

  var UserTable = mongoose.model('UserTable');

  UserTable.findOneAndUpdate(
    { user : req.user._id },
    {
      $addToSet : { removed : q },
      $pull : { subjects : q },
      updatedAt : new Date()
    },

    function (err, doc) {
      if(err) console.log(err);
      if(!doc) {
        var userTable = new UserTable({
          user    : req.user._id,
          removed : q
        });
        userTable.save(function (err) {
          if(err) console.log(err);
          return res.json('success');
        });
      }
      else return res.json('success');
    }
  );
};

exports.addSubject = function (req, res) {

  var q = decodeURIComponent(req.params.q);

  if(!q || !q.length) return res.json(400, 'wrong request');

  var UserTable = mongoose.model('UserTable');

  UserTable.findOneAndUpdate(
    { user : req.user._id },
    {
      $addToSet : { subjects : q },
      $pull : { removed : q },
      updatedAt : new Date()
    },

    function (err, doc) {
      if(err) console.log(err);
      if(!doc) {
        var userTable = new UserTable({
          user     : req.user._id,
          subjects : q
        });
        userTable.save(function (err) {
          if(err) console.log(err);
          return res.json('success');
        });
      }
      else return res.json('success');
    }
  );
};

exports.notFound = function (req, res) {
  res.json(404, { error : 'Not found' });
};
