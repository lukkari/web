var weekDay  = require('./weekday.js');

var week = function () {

  return {
    getSchedule : function (options) {
      options || (options = {});

      var date = new Date(options.date);

      // If saturday or sunday get next week
      if((date.getDay() == 0) || date.getDay() == 6)
        date.setDate(date.getDate() + 2);

      date.setDate(date.getDate() - date.getDay() + 1);

      var data  = [],
          count = 0;

      for(var i = 0; i < 5; i += 1) {
        weekDay.getSubjects({
          date   : new Date(date.getFullYear(), date.getMonth(), date.getDate() + i),
          type   : options.type,
          typeid : options.typeid,
          usertable : options.usertable,
          cb : function (err, subjects) {
            data.push(subjects);
            count += 1;

            if(err || (count > 4)) {
              // Sort by weekday num
              data.sort(function (a, b) {
                return a.weekday.num - b.weekday.num;
              });

              options.cb(err, data);
            }
          }
        });
      }
    }
  }
}();

module.exports = week;
