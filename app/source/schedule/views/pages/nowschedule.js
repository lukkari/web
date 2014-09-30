/**
 * Now schedule view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

var
  WeekDay = require('../../models/weekday'),
  WeekDayView = require('../weekday');

module.exports = Backbone.View.extend({

  template  : templates.schedule,
  className : 'schedule',

  subviews : {},

  initialize : function (options) {
    options = options || {};

    this.model.on('sync', this.updateView, this);
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    // Render template
    this.$el.html(tmpl(this.model.getDefaults(true)));
    // Render days(week)

    if(this.subviews.weekday) {
      this.$el.find('#days').html(this.subviews.weekday.render().el);
    }

    return this;
  },

  updateView : function () {
    this.subviews.weekday = new WeekDayView({
      model : new WeekDay(this.model.attributes)
    });

    this.render();
  },

  remove : function () {
    this.$el.empty();
    this.undelegateEvents();
  }
});
