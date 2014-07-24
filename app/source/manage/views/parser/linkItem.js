/**
 * Link item view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var templates = require('../../dist/');

module.exports = Backbone.View.extend({
  tagName : 'li',

  template : templates.linkItem,

  events : {
    'click .run' : 'runParse',
    'click .delete' : 'deleteParse'
  },

  initialize : function (options) {
    options = options || {};

    this.model = options.model;
  },

  /**
   * Execute Parse
   */
  runParse : function () {
    var btn = this.$el.find('.run');
    btn.attr('disabled', 'disabled');

    Backbone.$.ajax({
      url : this.model.runUrl(),
      success : (function () {
        console.log(this.model);
        btn.removeAttr('disabled');
      }).bind(this)
    });
  },

  /**
   * Remove Parse from the list and server
   */
  deleteParse : function () {
    if(!confirm('Are you sure you want to delete this Parse?')) return;

    this.model.destroy({
      success : (function () {
        this.$el.remove();
        this.remove();
      }).bind(this),
      error : function () {}
    });
  },

  render : function () {
    this.$el.html(_.template(this.template,
                             this.model.toJSON(),
                             { variable : 'data' }));

    return this;
  }
});
