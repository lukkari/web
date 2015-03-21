/**
 * Add app view
 */

var _ = require('underscore');
var Backbone = require('backbone');

var templates = require('../../dist/');

var App = require('../../models/app');

module.exports = Backbone.View.extend({

  tagName : 'article',
  className : 'section',
  template : templates.addAppForm,

  $appName : null,

  events : {
    'click #addAppBtn' : 'addApp'
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    this.$el.html(tmpl());

    this.$appName = this.$el.find('#addAppName');

    return this;
  },

  addApp : function () {
    var name = this.$appName.val();

    var app = new App({
      name : name
    });

    if(!app.isValid()) return;

    app.save([], {
      success : function (model) {
        this.clean();
        this.trigger('new_app', model);
      }.bind(this),

      error : function (model, response) {
        alert('Error adding application');
        console.log(response.responseText);
      }.bind(this)
    });
  },

  clean : function () {
    this.$appName.val('');
  }
});
