/**
 * Add link form view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var templates = require('../../dist/');

var Parse = require('../../models/parse');

module.exports = Backbone.View.extend({
  template : templates.addLinkForm,

  events : {
    'click #addLink' : 'addLink'
  },

  addLink : function () {
    /**
     * Add fields check
     */
    var parse = new Parse({
      url : this.$el.find('#link').val(),
      description : this.$el.find('#description').val()
    });
    parse.save();
    console.log(parse);
  },

  render : function () {
    this.$el.html(_.template(this.template, {}, { variable : 'data' }));

    return this;
  }
});
