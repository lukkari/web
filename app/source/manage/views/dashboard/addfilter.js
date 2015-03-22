/**
 * Add filter view
 */

var _ = require('underscore');
var Backbone = require('backbone');

var templates = require('../../dist/');

var Filter = require('../../models/filter');

module.exports = Backbone.View.extend({

  tagName : 'article',
  className : 'section',
  template : templates.addAppForm,

  $appName : null,

  events : {
    'click #addAppBtn' : 'addfilter'
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    this.$el.html(tmpl({ formModel : 'filter' }));

    this.$appName = this.$el.find('#addAppName');

    return this;
  },

  addfilter : function () {
    var name = this.$appName.val();

    var filter = new Filter({
      name : name
    });

    if(!filter.isValid()) return;

    filter.save([], {
      success : function (model) {
        this.clean();
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
