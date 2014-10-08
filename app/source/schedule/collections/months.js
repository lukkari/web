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
      model, i, j;

    for(i = -prec; i <= follow; i += 1) {
      j = m + i; // month to show
      j = (j < 0) ? (12 + j) : j;  // handle if month < 0
      j = (j > 11) ? (j - 12) : j; // handle if month > 11

      this.add(new Month([], {
        date : new Date(d.getFullYear(), j, 1)
      }));
    }
  }

});
