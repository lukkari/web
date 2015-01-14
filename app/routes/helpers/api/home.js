/**
 * Helper functions for api home routes
 */

var week = require('../../../libs/week');
var weekday = require('../../../libs/weekday');

// DB models
var Group = mongoose.model('Group');
var Teacher = mongoose.model('Teacher');
var Room = mongoose.model('Room');

/**
* Categories mapping
*/
exports.categories = {
  'group' : Group,
  'teacher' : Teacher,
  'room' : Room
};

/**
* Return category (groups, teachers, rooms)
*/
exports.getCategory = function (Model, res) {
  Model.getAll(function (err, docs) {
    if(err) console.log(err);
    return res.json(docs);
  });
};

/**
 * Get schedule for a week or current day
 */
exports.getSchedule = function (p, res) {
  if(!p.search) return res.status(400).send('Nothing to search');
  if(!p.category) return res.status(400).send('Specify category');

  var inc = 0;
  var today = new Date();
  var search = new RegExp(p.search, 'i');
  var fetchObj;
  var fetchCb;

  if(!p.now) {
    // If week schedule, get week number
    if(typeof w === 'undefined') {
      w = today.getStudyWeek();
    } else {
      // Return next year schedule for January,
      // when we are in August
      if(today.getStudyWeek() > 31 && w < 30) inc = 1;
      today = today.getDateOfISOWeek(w, today.getFullYear() + inc);
    }

    fetchObj = week;
    fetchCb = function (err, data) {
      return res.json({
        title : name,
        week : w,
        weekdays : data
      });
    };
  } else {
    // If day schedule
    fetchObj = weekDay;
    fetchCb = function (err, data) {
      data.title = name;
      return res.json(data);
    };
  }

  // Wrap function for passing name
  fetchCb = function (name) {
    return fetchCb;
  };

  categories[p.category]
    .find({ name : search })
    .limit(1)
    .lean()
    .exec(function (err, docs) {
      if(err) console.log(err);

      if(!docs.length) return res.status(404).send('Not found');

      var type = p.category + 's'; // Make type compatible with WeekDay
      var typeid = docs[0]._id;
      var name = docs[0].name;

      fetchObj.getSchedule({
        date : today,
        type : type,
        typeid : typeid,
        cb : fetchCb(name)
      });

    });
};
