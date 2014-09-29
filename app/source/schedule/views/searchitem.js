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
    var
      data = this.model.toJSON(),
      tmpl = _.template(this.template, { variable : 'data' });

    data.url = data.name.toUrl();
    this.$el.html(tmpl(data));

    return this;
  }
});
