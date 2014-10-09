/**
 * Subject view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist/');

module.exports = Backbone.View.extend({

  tagName : 'li',
  template : templates.subject,

  events : {
    'click button' : 'removeSubject'
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    this.$el.html(tmpl(this.model.toJSON()));
    return this;
  },

  removeSubject : function () {
    this.model.destroy();
    this.remove();
  }
});
