var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

module.exports = Backbone.View.extend({

  template  : templates.selectsubject,
  className : 'absolute-block',

  events : {
    'click #closeBlockBtn' : 'hide'
  },

  render : function () {
    this.$el.html(_.template(this.template, { variable : 'data' }));

    _.each(this.collection, function (item) {

    }, this);

    return this;
  },

  renderItem : function (item) {
    return this;
  },

  show : function () {
    this.$el.fadeIn();
  },

  hide : function () {
    this.$el.fadeOut();
  }

});
