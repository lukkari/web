/**
 * Weekbar Model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  /**
   * Set week numbers in model
   */
  setWeek : function (options) {
    options = options || {};

    var
      week  = parseInt(options.week, 10),
      query = options.q,
      // previous year
      pd = new Date(new Date().getFullYear() - 1, 11, 31), // get last day
      pw = pd.getWeek(), // get last week
      //current year
      ld = new Date(new Date().getFullYear(), 11, 31), // get last day
      lw = ld.getWeek(), // get last week

      attributes = {
        // if current week <= 1 -> show last week of the previous year
        prevUrl : query + '/w' + ((week <= 1) ? pw : (week - 1)),
        // current week
        weekUrl : query + '/w' + week,
        weekNum : week,
        // if current week >= last week of the current year -> show first week
        nextUrl : query + '/w' + ((week >= lw) ? 1 : (week + 1))
      };

    this.set(attributes);
    return this;
  }

});
