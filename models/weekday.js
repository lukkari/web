var mongoose = require('mongoose');

var weekDay = function () {
  var Subject = mongoose.model('Subject'),
      Group   = mongoose.model('Group'),
      Teacher = mongoose.model('Teacher'),
      Room    = mongoose.model('Room'),
      days    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    getSubjects : function (options) {
      options || (options = {});

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
      }

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

      options.usertable || (options.usertable = {});

      var qtype = {},
          qrem  = null,
          qadd  = null;
      qtype[options.type] = options.typeid;

      var query = {
        '$and' : [{
            'days' : {
              '$elemMatch' : {
                'date' : {
                  $gte : start,
                  $lt  : end
                }
              }
            }
          }
        ]
      };

      if(options.usertable.removed) {
        query['$and'].push({
          '_id' : {
            '$nin' : options.usertable.removed
          }
        });
      }

      if(options.usertable.subjects) {
        query['$and'].push({
          '$or' : [
            {
              '_id' : {
                '$in' : options.usertable.subjects
              }
            },
            qtype
          ]
        });
      }
      else query['$and'].push(qtype);

      Subject.find(query,
                  {
                    'name'     : 1,
                    'days.$'   : 1,
                    'groups'   : 1,
                    'teachers' : 1,
                    'rooms'    : 1
                  })
             .populate('groups', 'name')
             .populate('teachers', 'name')
             .populate('rooms', 'name')
             .sort({ 'days.date' : 1 })
             .exec(function (err, subjects) {
                data.subjects = subjects;
                if(typeof options.cb === 'function') options.cb(err, data);
             }
      );
    }
  }

}();

module.exports = weekDay;
