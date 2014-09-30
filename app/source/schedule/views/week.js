/**
 * Week view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Week = require('../collections/week'),
  WeekDayView = require('./weekday');

module.exports = Backbone.View.extend({

  render : function () {
    this.$el.empty();
    _.each(this.collection.models, function (item) {
      this.$el.append(this.renderWeekDay(item).el);
    }, this);

    return this;
  },

  renderWeekDay : function (item) {
    var weekDayView = new WeekDayView({
      model : item
    });

    return weekDayView.render();
  }

});
