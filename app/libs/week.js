/**
 * Module to form week schedule
 */
var weekDay  = require('./weekday');

var week = {

  getSchedule : function (options) {
    options = options || {};

    var date = new Date(options.date);

    // If saturday or sunday get next week
    if((date.getDay() === 0) || date.getDay() == 6) date.setDate(date.getDate() + 2);

    date.setDate(date.getDate() - date.getDay() + 1);

    var data  = [];
    var count = 0;
    var cb = function (err, subjects) {
      data.push(subjects);
      count += 1;

      if(err || (count > 4)) {
        // Sort by day
        data.sort(function (a, b) {
          return Date.parse(a.date) - Date.parse(b.date);
        });

        options.cb(err, data);
      }
    };

    for(var i = 0; i < 5; i += 1) {
      weekDay.getSubjects({
        date   : new Date(date.getFullYear(), date.getMonth(), date.getDate() + i),
        type   : options.type,
        typeid : options.typeid,
        usertable : options.usertable,
        cb : cb
      });
    }
  }

};

module.exports = week;
