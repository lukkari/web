/**
 * Search view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var Search = require('../../models/search');

var templates = require('../../dist');

module.exports = Backbone.View.extend({
  className : 'searchbox',
  template : templates.search,
  query : {},

  events : {
    'click .button' : 'search',
    'keyup .field'  : 'makeQuery'
  },

  initialize : function (options) {
    options = options || {};

    this.query = JSON.parse(options.query) || {};
    this.model = new Search(options);
    this.modelName = options.name;
  },

  render : function () {
    var
      data = this.model.toJSON(),
      tmpl = _.template(this.template, { variable : 'data' });

    var values = this.query;

    data.fields = Object.keys(data.schema).map(function (field) {
      var val = '';
      if(values.hasOwnProperty(field)) {
        val = values[field];
      }

      return {
        name : field,
        value : val
      };
    });

    this.$el.html(tmpl(data));

    this
      .$el
      .find('#query')
      .val(JSON.stringify(this.query, null, '  '));

    return this;
  },

  search : function () {
    var query = this.query;
    window.app.router.trigger('search-model', this.modelName, query);
  },

  /**
   * Form query into full query field
   * @param  {Object} e Event
   */
  makeQuery : function (e) {
    var $el = this.$(e.currentTarget);

    if($el.val()) {
      // If value is not empty
      this.query[$el.attr('id')] = $el.val();
    } else if(typeof this.query[$el.attr('id')] !== 'undefined') {
      // If value is empty and object property exists
      delete this.query[$el.attr('id')];
    }

    this
      .$el
      .find('#query')
      .val(JSON.stringify(this.query, null, '  '));
  }
});
