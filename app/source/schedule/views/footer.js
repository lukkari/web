/**
 * Footer view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist/');

module.exports = Backbone.View.extend({

  template : templates.footer,

  render : function () {
    var data = {
      year : new Date().getFullYear()
    };
    var tmpl = _.template(this.template, { variable : 'data' });

    this.$el.html(tmpl(data));
    return this;
  }

});
