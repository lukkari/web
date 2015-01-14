/**
* Home(public) API routes
*/

var mongoose = require('mongoose');

// DB models
var Group = mongoose.model('Group');
var Teacher = mongoose.model('Teacher');
var Room = mongoose.model('Room');
var Message = mongoose.model('Message');

// Helpers
var h = require('../../helpers/api/home');

/**
 * GET '/api/groups'
 */
exports.getGroups = function (req, res) {
  return h.getCategory(Group, res);
};


/**
 * GET '/api/teachers'
 */
exports.getTeachers = function (req, res) {
  return h.getCategory(Teacher, res);
};


/**
 * GET '/api/rooms'
 */
exports.getRooms = function (req, res) {
  return h.getCategory(Room, res);
};

/**
 * GET '/api/filters'
 */
exports.getFilters = function (req, res) {
  return h.getCategory(Filter, res);
};


/**
 * GET '/api/v1/schedule/:q/now' Get category now schedule
 */
exports.getNowSchedule = function (req, res) {
  return h.getSchedule({
    search : req.params.q,
    category : req.query.category,
    now : true
  }, res);
};


/**
 * GET '/api/v1/schedule/:q' Get category schedule
 */
exports.getSchedule = function (req, res) {
  return h.getSchedule({
    search : req.params.q,
    w : req.query.w,
    category : req.query.category,
    now : false
  }, res);
};

/**
 * POST '/api/message' Add message
 */
exports.sendMsg = function (req, res) {

  var message = new Message(req.body);

  message.save(function (err) {
    if(err) {
      console.log(err);
      return res.status(400).send('Message was not sent');
    }

    res.send('success');
  });

};

/**
 * GET '/api/*' Default route
 */
exports.notFound = function (req, res) {
  res.send(); // Silence is golden
};
