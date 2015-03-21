/**
 * App item view
 */

var _ = require('underscore');
var Backbone = require('backbone');

var templates = require('../../dist/');

module.exports = Backbone.View.extend({

  template : templates.appItem,
  tagName : 'li',

  events : {
    'click .remove-app-btn' : 'removeApp'
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

  removeApp : function () {
    if(!confirm('Are you sure you want to remove this app?')) {
      return;
    }

    this.model.destroy({
      success : function () {
        console.log('removed');
        this.$el.remove();
        this.remove();
      }.bind(this),

      error : function (model, response) {
        console.log(response.responseText);
        alert('Error removing application');
      }
    });
  }
});
