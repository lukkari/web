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
      Teacher = mongoose.model('Teacher');

  Group.findOne({ name : new RegExp(search, "i") }, function (err, group) {
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
    }
    else {
      Teacher.findOne({ name : new RegExp(search, "i") }, function (err, teacher) {
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
        }
        else res.json(404, { error : { code : 404, msg : 'Not found' }});

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

  Group.findOne({ name : new RegExp(search, "i") }, function (err, group) {
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
    }
    else {
      Teacher.findOne({ name : new RegExp(search, "i") }, function (err, teacher) {
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
        }
        else res.json(404, { error : { code : 404, msg : 'Not found' }});

      });
    }
  });

};


/**
 * POST '/api/messages' [description]
 */
exports.sendMsg = function (req, res) {

  var text = encodeURI(req.param('msg')),
      from = encodeURI(req.param('from'));

  if(text.length < 2) return res.json('success');

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


/**
 * GET '/api/*' [description]
 */
exports.notFound = function (req, res) {
  res.json(404, { error : 'Not found' });
};
