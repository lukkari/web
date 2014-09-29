/**
 * Section view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist/');

module.exports = Backbone.View.extend({

  template : templates.section,
  tagName : 'article',

  initialize : function (options) {
    options = options || {};

    this.params = options;
    this.collection = options.collection;
    this.ModelView = options.ModelView;

    try {
      this.listenTo(this.collection, 'sync', this.render);
      this.listenTo(this.collection, 'error', this.syncFail);
      this.collection.fetch();
    } catch (e) {}
  },

  syncFail : function () {
    console.log('sync failed');
  },

  render : function () {
    var
      tmpl = _.template(this.template, { variable : 'data' }),
      $sectionData;

    this.$el.html(tmpl({
      title : this.params.title || 'Section',
      className : this.params.className || ''
    }));

    $sectionData = this.$el.find('.section-data');
    _.each(this.collection.models, function (item) {
      $sectionData.append(this.renderItem(item));
    }, this);

    return this;
  },

  renderItem : function (item) {
    var modelView = new this.ModelView({
      model : item
    });

    return modelView.render().el;
  }
});
