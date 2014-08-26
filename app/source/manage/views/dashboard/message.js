/**
 * Message view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var template = require('../../dist/');

module.exports = Backbone.View.extend({

  template : template.message,
  tagName : 'li',

  initialize : function (options) {
    options = options || {};

    this.model = options.model;
  },

  render : function () {
    var data = this.model.toJSON();

    data.date = new Date(data.createdAt).toGMTString();

    this.$el.html(_.template(this.template,
                             data,
                             { variable : 'data' }));

    return this;
  }
});
