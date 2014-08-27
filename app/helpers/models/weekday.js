var mongoose = require('mongoose');

var weekDay = function () {
  var
    Subject = mongoose.model('Subject'),
    Entry   = mongoose.model('Entry'),
    days    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    getSubjects : function (options) {
      options = options || {};

      var date    = new Date(options.date);

      var data = {
        weekday  : {
          name : days[date.getDay()],
          num  : date.getDay()
        },
        date : date,
        subjects : []
      };

      var start = new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end   = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);


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
