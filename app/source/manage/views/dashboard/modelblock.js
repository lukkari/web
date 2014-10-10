/**
 * Model blocks view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var template = require('../../dist/');

module.exports = Backbone.View.extend({

  template : template.modelblock,
  tagName : 'li',

  events : {
    'click .clearLink' : 'clearModel'
  },

  clearModel : function (e) {
    console.log('clear');
  },

  initialize : function (options) {
    options = options || {};

    this.model = options.model;
  },

  render : function () {
    var
      data = this.model.toJSON(),
      tmpl = _.template(this.template, { variable : 'data' });

    data.link = '/model/' + data.name;
    this.$el.html(tmpl(data));

    return this;
  }
});
