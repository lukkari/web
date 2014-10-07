/**
 * Home(public) API routes
 */

var
  mongoose = require('mongoose'),
  week     = require('../../helpers/models/week'),
  weekday  = require('../../helpers/models/weekday');


/**
 * GET '/api/groups' [description]
 */
exports.getGroups = function (req, res) {

  var Group = mongoose.model('Group');

  Group.getAll(function (err, groups) {
    if(err) {
      console.log(err);
      return res.json(400, { error : { code : 400, msg : 'Unknown mistake' } });
    }

    return res.json(groups);
  });

};


/**
 * GET '/api/teachers' [description]
 */
exports.getTeachers = function (req, res) {

  var Teacher = mongoose.model('Teacher');

  Teacher.getAll(function (err, teacher) {
    if(err) {
      console.log(err);
      return res.json(400, { error : { code : 400, msg : 'Unknown mistake' } });
    }

    return res.json(teacher);
  });

};


/**
 * GET '/api/rooms' [description]
 */
exports.getRooms = function (req, res) {

  var Room = mongoose.model('Room');

  Room.getAll(function (err, room) {
    if(err) {
      console.log(err);
      return res.json(400, { error : { code : 400, msg : 'Unknown mistake' } });
    }

    return res.json(room);
  });
};


/**
 * GET '/api/schedule/:q/now' [description]
 */
exports.getNow = function (req, res) {

  var search = req.params.q;

  if(!search || !search.length) return res.json(400, { error : { code : 500, msg :'Wrong request' }});

  var today = new Date();
  search = search.replace(/_/g, ' ').replace(/ *\([^)]*\) */g, '').trim();

  var Group   = mongoose.model('Group'),
      Teacher = mongoose.model('Teacher'),
      Room    = mongoose.model('Room');

  Group
    .findOne({ name : new RegExp(search, "i") })
    .lean()
    .exec(function (err, group) {
      if(err) {
        console.log(err);
        return res.json(400, { error : { code : 400, msg : 'Unknown mistake' }});
      }

      if(group) {
        weekday.getSubjects({
          date   : today,
          type   : 'groups',
          typeid : group._id,
          cb : function (err, data) {
            var newdata = data;
            data.title = group.name;
            res.json(newdata);
          }
        });
      } else {
        Teacher
          .findOne({ name : new RegExp(search, "i") })
          .lean()
          .exec(function (err, teacher) {
            if(err) {
              console.log(err);
              return res.json(400, { error : { code : 400, msg : 'Unknown mistake' }});
            }

            if(teacher) {
              weekday.getSubjects({
                date   : today,
                type   : 'teachers',
                typeid : teacher._id,
                cb : function (err, data) {
                  var newdata = data;
                  data.title = teacher.name;
                  res.json(newdata);
                }
              });
            } else {
              Room
                .findOne({ name : new RegExp(search, "i") })
                .lean()
                .exec(function (err, room) {
                  if(err) {
                    console.log(err);
                    return res.json(400, { error : { code : 400, msg : 'Unknown mistake' }});
                  }

                  if(room) {
                    weekday.getSubjects({
                      date   : today,
                      type   : 'rooms',
                      typeid : room._id,
                      cb : function (err, data) {
                        var newdata = data;
                        data.title = room.name;
                        res.json(newdata);
                      }
                    });
                  } else return res.json(404, { error : { code : 404, msg : 'Not found' }});

                });
            }

          });
      }

    });
};


/**
 * GET '/api/schedule/:q' [description]
 */
exports.getSchedule = function (req, res) {

  var search = req.params.q,
      w      = req.param('w');


  if(!search || !search.length) return res.json(400, { error : { code : 400, msg :'Wrong request' }});

  search = search.replace(/_/g, ' ').replace(/ *\([^)]*\) */g, '').trim();
  var today = new Date();

  if(typeof w !== 'undefined') {
    var i = 0;
    if(today.getStudyWeek() > (w + 35)) i = 1;

    today = today.getDateOfISOWeek(w, today.getFullYear() + i);
  }
  else w = new Date().getStudyWeek();

  var
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    end   = new Date(start.getFullYear(), start.getMonth(), start.getDate()+6);

  var
    Group   = mongoose.model('Group'),
    Teacher = mongoose.model('Teacher'),
    Room    = mongoose.model('Room'),
    Entry   = mongoose.model('Entry');

  Group
    .findOne({ name : new RegExp(search, "i") })
    .lean()
    .exec(function (err, group) {
      if(err) {
        console.log(err);
        return res.json(400, { error : { code : 400, msg : 'Unknown mistake' }});
      }

      if(group) {
        week.getSchedule({
          date : today,
          type : 'groups',
          typeid : group._id,
          cb : function (err, data) {
            res.json({ title : group.name, week : w, weekdays : data });
          }
        });
      } else {
        Teacher
          .findOne({ name : new RegExp(search, "i") })
          .lean()
          .exec(function (err, teacher) {
            if(err) {
              console.log(err);
              return res.json(400, { error : { code : 400, msg : 'Unknown mistake' }});
            }

            if(teacher) {
              week.getSchedule({
                date   : today,
                type   : 'teachers',
                typeid : teacher._id,
                cb : function (err, data) {
                  res.json({ title : teacher.name, week : w, weekdays : data });
                }
              });
            } else {
              Room
                .findOne({ name : new RegExp(search, "i") })
                .lean()
                .exec(function (err, room) {
                  if(err) {
                    console.log(err);
                    return res.json(400, { error : { code : 400, msg : 'Unknown mistake' }});
                  }

                  if(room) {
                    week.getSchedule({
                      date   : today,
                      type   : 'rooms',
                      typeid : room._id,
                      cb : function (err, data) {
                        res.json({ title : room.name, week : w, weekdays : data });
                      }
                    });
                  } else return res.json(404, { error : { code : 404, msg : 'Not found' }});
                });
            }

          });
      }
    });

};


/**
 * POST '/api/message' [description]
 */
exports.sendMsg = function (req, res) {

  var text = encodeURI(req.param('message'));

  if(text.length < 4) return res.json('success');

  var
    Message = mongoose.model('Message'),
    message = new Message({ message : text });

  message.save(function (err) {
    if(err) {
      console.log(err);
      return res.json(400, err);
    }

    res.json('success');
  });

};

/**
 * GET '/api/*' [description]
 */
exports.notFound = function (req, res) {
  res.send();
};


/**
 * GET '/api/wakeup'
 */
exports.wakeup = function (req, res) {
  var d = new Date();
  console.log('Wake up triggered: ' + d);
  res.send(d);
};

/**
 * GET '/api/baseurl'
 */
exports.baseurl = function (req, res) {
  res.send('http://lukkari.herokuapp.com/');
};

exports.getMySchedule = function (req, res) {

  if(!req.isAuthenticated()) return res.json(401, { error : 'Authentication is required' });

  var w = req.param('w');

  var today = new Date();

  if(typeof w !== 'undefined') {
    var i = 0;
    if(today.getStudyWeek() > (w + 35)) i = 1;

    today = today.getDateOfISOWeek(w, today.getFullYear() + i);
  }
  else w = new Date().getStudyWeek();

  var UserTable = mongoose.model('UserTable');

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
          return res.json({ title : 'My schedule', week : w, weekdays : data });
        }
      });
    });
};
