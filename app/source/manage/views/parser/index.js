/**
 * Parser page view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var templates = require('../../dist/');

var
  LinkListView = require('./linkList');
  AddLinkFormView = require('./addLinkForm');

module.exports = Backbone.View.extend({
  template : templates.parser,

  className : 'parser',

  subviews : {},

  initialize : function (options) {
    options = options || {};

    this.subviews.linkList = new LinkListView({
      collection : options.parses
    });
    this.subviews.addLinkForm = new AddLinkFormView({
      linkListView : this.subviews.linkList
    });
  },

  render : function () {
    this.$el.empty();

    _.each(this.subviews, function (view) {
      this.$el.append(view.render().el);
    }, this);

    return this;
  },

  remove : function () {
    _.invoke(this.subviews, 'remove');
    this.subviews = {};

    Backbone.View.prototype.remove.apply(this, arguments);
  }
});
