/**
 * Calendar view
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Month = require('../../models/month'),

  Months = require('../../collections/months'),

  MonthView = require('../month');


module.exports = Backbone.View.extend({

  initialize : function (options) {
    options = options || {};

    this.collection = new Months();

    this.buildCalendar();
  },

  /**
   * Build calendar
   *   show current month, one preceding and two following
   */
  buildCalendar : function () {
    var
      d = new Date(),   // current date
      m = d.getMonth(), // current month
      prec = 1,         // number of preceding months to show
      follow = 2,       // number of following months to show
      model, i, j;

    for(i = -prec; i <= follow; i += 1) {
      j = m + i; // month to show
      j = (j < 0) ? (12 + j) : j;  // handle if month < 0
      j = (j > 11) ? (j - 12) : j; // handle if month > 11

      this
        .collection
        .add(new Month([], {
            date : new Date(d.getFullYear(), j, 1)
          }));
    }

  },

  /**
   * Update calendar with current week
   * @param  {Object} options parameters of new schedule page
   */
  setWeek : function (options) {
    options = options || {};

    var week = options.week;

    // Clear previous selection
    this
      .$el
      .find('tr.selected')
      .removeClass('selected');

    // Set new selection
    this
      .$el
      .find("tr[data-week='" + week + "']")
      .addClass('selected');

    return this;
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item) {
      this
        .$el
        .append(this.renderItem(item).el);
    }.bind(this));

    return this;
  },

  renderItem : function (item) {
    var monthView = new MonthView({
      model : item
    });

    return monthView.render();
  }
});
