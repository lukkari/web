/**
 * Schedule view
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

var
  Schedule = require('../models/schedule'),

  Schedules = require('../collections/schedules'),

  CalendarView = require('./calendar'),
  WeekBarView = require('./weekbar'),
  WeekView = require('./week');


module.exports = Backbone.View.extend({
  $parent   : $('#content'),
  template  : templates.schedule,
  className : 'schedule',

  initialize : function (options) {
    options = options || {};

    this.collection = new Schedules();
    this.views = {
      calendar : new CalendarView(options),
      weekbar  : new WeekBarView(options)
    };

    this.preRender(options);
    this.load(options);
  },

  /**
   * Load new schedule page or find fetched page
   * @param  {Object} options object with query string and week number
   */
  load : function (options) {
    options = options || {};

    var that     = this,
        schedule = this.collection.getByQuery(options.url);

    // Update weekbar and calendar
    this.views.weekbar.setWeek(options);
    this.views.calendar.setWeek(options);

    if(Array.isArray(schedule) && schedule.length) {
      this.model = schedule[0];
      this.render(options);
    } else {
      this.model = new Schedule([], options);
      this.model.fetch({
        success : function () {
          that.collection.add(that.model);
          that.render(options);
        },

        error : function () {
          // TO DO!
        }
      });
    }

    return this;
  },

  show : function (options) {
    this
      .load(options)
      .$el
      .show();
    return this;
  },

  hide : function () {
    this.$el.hide();
    return this;
  },

  /**
   * Render only once
   */
  preRender : function (options) {
    options = options || {};

    var tmpl = _.template(this.template);

    // Render template
    this
      .$el
      .html(tmpl())
      .show();

    // Render calendar
    this
      .$el
      .find('#calendar')
      .html(this.views.calendar.render(options).el);

    // Add element to the page
    this
      .$parent
      .append(this.el);
  },

  render : function (options) {
    this.views.week = new WeekView(this.model.getDays());

    // Render title
    this
      .$el
      .find('#scheduleTitle')
      .text(this.model.getTitle());

    // Render weekbar
    this
      .$el
      .find('#weekBar')
      .html(this.views.weekbar.render().el);

    // Render days(week)
    this
      .$el
      .find('#days')
      .html(this.views.week.render().el)
      .fadeIn('fast');

    return this;
  }
});
