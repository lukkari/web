/**
 * Home(public) API routes
 */

var mongoose = require('mongoose');
var week = require('../../libs/week');
var weekday = require('../../libs/weekday');
var tasker = require('../../libs/tasker');

// DB models
var Group = mongoose.model('Group');
var Teacher = mongoose.model('Teacher');
var Room = mongoose.model('Room');
var Filter = mongoose.model('Filter');
var Message = mongoose.model('Message');
var UserTable = mongoose.model('UserTable');

// Helpers

/**
 * Return category (groups, teachers, rooms)
 */
var getCategory = function (Model, res) {
  Model.getAll(function (err, results) {
    if(err) {
      console.log(err);
      return res.status(400).send('Unknown mistake');
    }

    return res.json(results);
  });
};

/**
 * Create tasker for all categories
 */
var searchCategories = function (search) {

  var categories = ['Group', 'Teacher', 'Room'];
  search = search.replace(/_/g, ' ').replace(/ *\([^)]*\) */g, '').trim();
  search = { name : new RegExp(search, "i") };

  return tasker(categories, function (category, next, done) {
    mongoose.model(category)
      .findOne(search)
      .lean()
      .exec(function (err, model) {
        if(err) return done(err);
        if(model) {
          model.type = category.toLowerCase() + 's';
          return done(null, model);
        } else next(null);
      });
  });
};



/**
 * GET '/api/groups'
 */
exports.getGroups = function (req, res) {
  return getCategory(Group, res);
};


/**
 * GET '/api/teachers'
 */
exports.getTeachers = function (req, res) {
  return getCategory(Teacher, res);
};


/**
 * GET '/api/rooms'
 */
exports.getRooms = function (req, res) {
  return getCategory(Room, res);
};

/**
 * GET '/api/filters'
 */
exports.getFilters = function (req, res) {
  return getCategory(Filter, res);
};


/**
 * GET '/api/schedule/:q/now'
 */
exports.getNowSchedule = function (req, res) {

  var search = req.params.q;
  var today = new Date();

  if(!search || !search.length) return res.status(400).send('Wrong request');

  searchCategories(search)
    .fail(function (err) { res.status(400).send('Unknown mistake'); })
    .done(function (model) {
      if(!model.length) {
        return res.status(404).send('Not found');
      }
      model = model[0];
      weekday.getSubjects({
        date   : today,
        type   : model.type,
        typeid : model._id,
        cb : function (err, data) {
          data.title = model.name;
          res.json(data);
        }
      });
    })
    .run();

};


/**
 * GET '/api/schedule/:q' [description]
 */
exports.getSchedule = function (req, res) {

  var search = req.params.q;
  var w = req.param('w');
  var today = new Date();
  var i = 0;
  var start, end;

  if(!search || !search.length) return res.status(400).send('Wrong request');

  if(typeof w !== 'undefined') {
    // Return next year schedule for january,
    // when we are in August
    if(today.getStudyWeek() > 31 && w < 30) i = 1;
    today = today.getDateOfISOWeek(w, today.getFullYear() + i);
  } else w = today.getStudyWeek();

  searchCategories(search)
    .fail(function (err) { res.status(400).send('Unknown mistake'); })
    .done(function (model) {
      if(!model.length) {
        return res.status(404).send('Not found');
      }
      model = model[0];
      week.getSchedule({
        date : today,
        type : model.type,
        typeid : model._id,
        cb : function (err, data) {
          res.json({ title : model.name, week : w, weekdays : data });
        }
      });
    })
    .run();
};


/**
 * POST '/api/message' [description]
 */
exports.sendMsg = function (req, res) {

  var mess = req.body;
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
