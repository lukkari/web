/**
 * Pagination item view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

module.exports = Backbone.View.extend({
  template : $('#paginationTemplate').html(),

  render : function () {
    var tmpl = _.template(this.template);

    this.$el.html(tmpl(this.model.toJSON()));
    return this;
  }
});
