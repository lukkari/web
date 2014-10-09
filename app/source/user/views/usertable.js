/**
 * User table view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Subject = require('../models/subject'),
  SubjectView = require('./subject');

module.exports = Backbone.View.extend({

  initialize : function () {
    this.model.on('sync', this.render, this);
  },

  render : function () {
    this.$el.empty();

    _.each(this.model.sections, function (section, key) {

      _.each(section.models, function (item) {
        this.$el.append(this.renderItem(item, key).el);
      }, this);

    }, this);

    return this;
  },

  renderItem : function (item, className) {
    var subjectView = new SubjectView({
      model : item,
      className : className
    });

    return subjectView.render();
  }
});
