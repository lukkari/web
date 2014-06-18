/**
 * Calendar month model
 */

var Backbone = require('backbone');

var months = require('../util/months');

module.exports = Backbone.Model.extend({
  initialize : function (data, options) {
    options = options || {};
    this.date = options.date;

    var d = new Date(this.date);

    this.set({
      month : months.full[d.getMonth()]
    });

    this.buildMonth();
  },

  /**
   * Build current month
   */
  buildMonth : function () {
    var
      today = new Date(),
      d = new Date(this.date),
      fd = new Date(d.getFullYear(), d.getMonth(), 1), // first day of the month
      ls = new Date(d.getFullYear(), d.getMonth() + 1, 0), // last day of the month
      oneday = 24*60*60*1000, // one day in milliseconds
      weeks = [],
      i, j, dur, week;

    d.setDate(1); // set day to first (if wasn't set)
    d.setDate(-d.getDay()); // go back to the first day of week

    ls.setDate(ls.getDate() + 6 - (ls.getDay() || 7)); // get last day of the last week

    dur = Math.round((ls.getTime() - d.getTime()) / oneday) + 1; // get difference in days

    for(i = 0; i < dur; i += 1) {
      if(d.getDay() === 0) {
        if(typeof week !== 'undefined') weeks.push(week);

        week = {
          week : d.getWeek(),
          isCurrent : (d.getWeek() === today.getStudyWeek()),
          days : []
        };

      } else if(d.getDay() !== 6) {
        week.days.push({
          // if current month is not equal to building month
          isOld : (d.getMonth() !== fd.getMonth()),
          day : d.getDate()
        });
      }
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);

    this.set({
      weeks : weeks
    });

    return this;
  },
});
