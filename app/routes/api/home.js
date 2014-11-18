/**
 * Home(public) API routes
 */

var
  mongoose = require('mongoose'),
  week     = require('../../helpers/models/week'),
  weekday  = require('../../helpers/models/weekday');


/**
 * GET '/api/groups'
 */
exports.getGroups = function (req, res) {

  var Group = mongoose.model('Group');

  Group.getAll(function (err, groups) {
    if(err) {
      console.log(err);
      return res.status(400).send('Unknown mistake');
    }

    return res.json(groups);
  });

};


/**
 * GET '/api/teachers'
 */
exports.getTeachers = function (req, res) {

  var Teacher = mongoose.model('Teacher');

  Teacher.getAll(function (err, teachers) {
    if(err) {
      console.log(err);
      return res.status(400).send('Unknown mistake');
    }

    return res.json(teachers);
  });

};


/**
 * GET '/api/rooms'
 */
exports.getRooms = function (req, res) {

  var Room = mongoose.model('Room');

  Room.getAll(function (err, rooms) {
    if(err) {
      console.log(err);
      return res.status(400).send('Unknown mistake');
    }

    return res.json(rooms);
  });
};


/**
 * GET '/api/schedule/:q/now'
 */
exports.getNowSchedule = function (req, res) {

  var search = req.params.q;
  var today = new Date();
  var
    Group   = mongoose.model('Group'),
    Teacher = mongoose.model('Teacher'),
    Room    = mongoose.model('Room');

  if(!search || !search.length) return res.status(400).send('Wrong request');

  search = search.replace(/_/g, ' ').replace(/ *\([^)]*\) */g, '').trim();

  Group
    .findOne({ name : new RegExp(search, "i") })
    .lean()
    .exec(function (err, group) {
      if(err) {
        console.log(err);
        return res.status(400).send('Unknown mistake');
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
              return res.status(400).send('Unknown mistake');
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
                    return res.status(400).send('Unknown mistake');
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
                  } else return res.status(404).send('Not found');

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

  var
    search = req.params.q,
    w      = req.param('w');


  if(!search || !search.length) return res.status(400).send('Wrong request');

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
    Room    = mongoose.model('Room');

  Group
    .findOne({ name : new RegExp(search, "i") })
    .lean()
    .exec(function (err, group) {
      if(err) {
        console.log(err);
        return res.status(400).send('Unknown mistake');
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
              return res.status(400).send('Unknown mistake');
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
                    return res.status(400).send('Unknown mistake');
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
                  } else return res.status(404).send('Not found');
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

  var mess = req.body;
  var Message = mongoose.model('Message');
  var message = new Message(mess);

  if(!mess.message || mess.message.length < 4) {
    return res.status(400).send('Message is too short');
  }

  message.save(function (err) {
    if(err) {
      console.log(err);
      return res.status(400).send("Message can't be send");
    }

    res.send('success');
  });

};

/**
 * GET '/api/*' [description]
 */
exports.notFound = function (req, res) {
  res.send();
};

/**
 * GET '/api/schedule/my' Return user's schedule
 */
exports.getMySchedule = function (req, res) {

  if(!req.isAuthenticated()) return res.status(401).send('Authentication is required');

  var w = req.param('w');
  var today = new Date();
  var UserTable = mongoose.model('UserTable');

  if(typeof w !== 'undefined') {
    var i = 0;
    if(today.getStudyWeek() > (w + 35)) i = 1;

    today = today.getDateOfISOWeek(w, today.getFullYear() + i);
  } else w = new Date().getStudyWeek();

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
 * GET '/api/schedule/my/now' Return user's now schedule
 */
exports.getMyNowSchedule = function (req, res) {

  if(!req.isAuthenticated()) return res.status(401).send('Authentication is required');

  var w = req.param('w');
  var today = new Date();
  var UserTable = mongoose.model('UserTable');

  if(typeof w !== 'undefined') {
    var i = 0;
    if(today.getStudyWeek() > (w + 35)) i = 1;

    today = today.getDateOfISOWeek(w, today.getFullYear() + i);
  } else w = new Date().getStudyWeek();

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
