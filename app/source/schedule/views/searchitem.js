/**
 * Search item view (Link item)
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

module.exports = Backbone.View.extend({
  tagName  : 'li',
  template : templates.searchitem,

  render : function () {
    var data = this.model.toJSON();
    data.url = data.name.toUrl();

    this
      .$el
      .html(_.template(this.template,
                       data,
                       { variable : 'data' }));

    return this;
  }
});
