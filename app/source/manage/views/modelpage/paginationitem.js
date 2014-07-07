/**
 * Pagination item view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

module.exports = Backbone.View.extend({
  template : '',

  render : function () {
    var tmpl = _.template(this.template);

    this.$el.html(tmpl(this.model.toJSON()));
    return this;
  }
});
