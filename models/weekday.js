var mongoose = require('mongoose');

var weekDay = function () {
  var Subject = mongoose.model('Subject'),
      Group   = mongoose.model('Group'),
      Teacher = mongoose.model('Teacher'),
      Room    = mongoose.model('Room'),
      days    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    getSubjects : function (pdate, ptype, ptypeid, cb) {
      var date    = new Date(pdate);

      var data = {
        week     : date.getWeek(),
        weekday  : {
          name : days[date.getDay()],
          num  : date.getDay()
        },
        date     : {
          day   : date.getDate(),
          month : date.getMonth()
        },
        subjects : []
      }

      var start = new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end   = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);

      var query = {
        'date' : {
          $gte : start,
          $lt  : end
        }
      }
      switch(ptype) {
        case 'groups':
          query.groups = mongoose.Types.ObjectId(ptypeid.toString());
          break;
        case 'teachers':
          query.teachers = mongoose.Types.ObjectId(ptypeid.toString());
          break;
      }

      Subject.find(query,
                  {
                    name     : 1,
                    date     : 1,
                    duration : 1,
                    groups   : 1,
                    teachers : 1,
                    rooms    : 1
                  })
             .populate('groups', 'name')
             .populate('teachers', 'name')
             .populate('rooms', 'name')
             .sort({ date : 1 })
             .exec(function (err, subjects) {
                data.subjects = subjects;
                cb(err, data);
             });
    }
  }

}();

module.exports = weekDay;