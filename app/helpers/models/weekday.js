var mongoose = require('mongoose');

var weekDay = function () {
  var
    Subject = mongoose.model('Subject'),
    Entry   = mongoose.model('Entry'),
    Group   = mongoose.model('Group'),
    Teacher = mongoose.model('Teacher'),
    Room    = mongoose.model('Room'),
    days    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    getSubjects : function (options) {
      options = options || {};

      var date    = new Date(options.date);

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
      };

      var start = new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end   = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);

      /**
       {
          $and : [{
              days : {
                $elemMatch : {
                  date : {
                    $gte : start,
                    $lt : end
                  }
                }
              }
            },
            {
              $nin : options.usertable.removed
            },
            {
              $or : [{
                  groups : typeid
                },
                {
                  _id : options.usertable.subjects
                }
              ]
            }
          ]
        }
       */

      options.usertable = options.usertable || {};


      var query = {
        'date' : {
          $gte : start,
          $lt  : end
        }
      };

      query[options.type] = options.typeid;


      Entry
        .find(query, {
            'parse' : 0,
            'createdAt' : 0
          })
        .populate('groups', 'name')
        .populate('teachers', 'name')
        .populate('rooms', 'name')
        .populate('subject', 'name')
        .sort({ 'date' : 1 })
        .exec(function(err, subjects) {
          data.subjects = subjects;
          if(typeof options.cb === 'function') options.cb(err, data);
        });

    }
  };

}();

module.exports = weekDay;
