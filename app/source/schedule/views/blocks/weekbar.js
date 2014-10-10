/**
 * Weekbar view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

var WeekBar = require('../../models/weekbar');

module.exports = Backbone.View.extend({
  className : 'weekselector',
  template  : templates.weekbar,

  initialize : function (options) {
    options = options || {};

    this.model = new WeekBar();
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

  /**
   * Set week numbers in model
   */
  setWeek : function (options) {
    this.model.setWeek(options);
  }
});
