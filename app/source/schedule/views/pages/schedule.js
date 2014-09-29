/**
 * Schedule view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

var
  CalendarView = require('../blocks/calendar'),
  WeekBarView = require('../blocks/weekbar'),
  WeekView = require('../week');


module.exports = Backbone.View.extend({

  template  : templates.schedule,
  className : 'schedule',

  initialize : function (options) {
    options = options || {};

    this.subviews = {
      calendar : new CalendarView(options),
      weekbar  : new WeekBarView(options)
    };
  },

  render : function (options) {
    var tmpl = _.template(this.template, { variable : 'data' });
    // Render template
    this.$el.html(tmpl(this.model.getDefaults()));

    // Render calendar
    this.subviews.calendar.setElement(this.$el.find('#calendar')).render();

    this.subviews.week = new WeekView(this.model.getDays());
    this.subviews.weekbar.setWeek(options);
    this.subviews.calendar.setWeek(options);

    // Render weekbar
    this
      .$el
      .find('#weekBar')
      .html(this.subviews.weekbar.render().el);

    if(this.model.isEditable()) {
      this.$el.find('#editBar').show();
    }

    // Render days(week)
    this.subviews.week.setElement(this.$el.find('#days')).render();

    return this;
  },

  remove : function () {}
});
