/**
 * Add link form view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var templates = require('../../dist/');

var Parse = require('../../models/parse');

module.exports = Backbone.View.extend({
  className : 'add-link-form',

  template : templates.addLinkForm,

  events : {
    'click #addLink' : 'addLink'
  },

  initialize : function (options) {
    options = options || {};

    this.linkListView = options.linkListView;
  },

  /**
   * Save parse to db and put 'em to the linkList
   */
  addLink : function () {
    var parse = new Parse({
      url : this.$el.find('#link').val(),
      description : this.$el.find('#description').val()
    });

    // When parse is invalid do nothing
    if(!parse.isValid()) return;

    parse.save([], {
      success : (function () {
        // add to parses list
        this.linkListView.addParse(parse);
        this.clean();
      }).bind(this),
      error : function () {
        // show error message
      }
    });
  },

  /**
   * Clean input fields
   */
  clean : function () {
    this.$el.find('#link').val('');
    this.$el.find('#description').val('');
  },

  render : function () {
    this.$el.html(_.template(this.template, {}, { variable : 'data' }));

    return this;
  }
});
