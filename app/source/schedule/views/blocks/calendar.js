/**
 * Calendar view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Months = require('../../collections/months'),
  MonthView = require('./month');

module.exports = Backbone.View.extend({

  initialize : function (options) {
    options = options || {};

    this.collection = new Months();
    this.collection.populate();
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

    // Set new selection and
    // get its parent offset
    var offset = this
                  .$el
                  .find("tr[data-week='" + week + "']")
                  .addClass('selected')
                  .closest('table')
                  .offset();

    this.scroll(offset);

    return this;
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item) {
      this.$el.append(this.renderItem(item).el);
    }.bind(this));

    return this;
  },

  renderItem : function (item) {
    var monthView = new MonthView({
      model : item
    });

    return monthView.render();
  },

  scroll : function (offset) {
    offset = offset || {};

    if(!offset.left) return;

    this.$el.scrollLeft(offset.left - 50);
  }
});
