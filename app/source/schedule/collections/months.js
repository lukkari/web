/**
 * Calendar months collection
 */

var Backbone = require('backbone');

var Month = require('../models/month');

module.exports = Backbone.Collection.extend({
  model : Month,

  /**
   * Build calendar(add month models to collection)
   */
  populate : function () {
    var
      d = new Date(),   // current date
      m = d.getMonth(), // current month
      prec = 3,         // number of preceding months to show
      follow = 4,       // number of following months to show
      model, i, j, k;

    for(i = -prec; i <= follow; i += 1) {
      k = 0;
      j = m + i; // month to show

      if(j < 0) {
        // Show month from the previous year
        k = -1;
        j = 12 + j;
      } else if(j > 11) {
        // Show month from the next year
        k = 1;
        j = j - 12;
      }

      this.add(new Month([], {
        date : new Date(d.getFullYear() + k, j, 1)
      }));
    }
  }

});
