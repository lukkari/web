/**
 * Parser page view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var templates = require('../dist');

module.exports = Backbone.view.extend({

  template : templates.parserpage,

  events : {
    'click #newlinkbtn' : 'addLink'
  },

  initialize : function (options) {

  },

  /**
   * Add new parse link
   */
  addLink : function () {
    console.log(this.$('#newlink').val());
  }


});
