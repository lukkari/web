var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    helpers = require('../helpers/');

Backbone.$ = $;

var app = app || {};

var modelHelper = {};

app.Model = Backbone.Model.extend({
  initialize : function () {
    this.urlRoot = this.url() + '/' + this.attributes._id;
  }
});

app.Models = Backbone.Collection.extend({
  model : app.Model,
  url   : '/manage/api/model/',

  initialize : function (data, options) {
    options = options || {};

    this.url += options.name;
  }
});

app.ModelView = Backbone.View.extend({
  tagName   : 'li',
  className : 'row',
  template  : $('#modelTemplate').html(),

  events : {
    'click .edit'   : 'editModel',
    'click .delete' : 'deleteModel',
    'click .save'   : 'saveModel',
    'click .cancel' : 'cancelEdit'
  },

  initialize : function (options) {
    options = options || {};

    this.index = +options.index || 1;
  },

  render : function () {
    var tmpl = _.template(this.template),
        data = this.model.toJSON();

    var newdata = {
      model : JSON.stringify(data, null, '  '),
      index : this.index
    };

    this.$el.html(tmpl(newdata));

    // Find buttons
    this.$btn = {
      edit   : this.$el.find('.edit'),
      delete : this.$el.find('.delete'),
      save   : this.$el.find('.save'),
      cancel : this.$el.find('.cancel')
    };

    // Find pre element with data
    this.$pre = this.$el.find('pre');

    // Find error div
    this.$error = this.$el.find('#error');

    return this;
  },

  /**
   * Edit model (switch to editing mode)
   */
  editModel : function () {
    this.$error.text('');

    this.$btn.edit.hide();
    this.$btn.save.show();
    this.$btn.cancel.show();

    this
      .$pre
      .attr('contenteditable', 'true')
      .focus();
  },

  /**
   * Delete model
   */
  deleteModel : function () {
    this.$error.text('');

    if(!confirm('Are you sure you want to delete this document?')) return;

    this.model.sync('delete', this.model, {
      success : function () {
        this.$el.fadeOut('fast');
      }.bind(this),

      error : function () {
        this.$error.text('Cannot delete document');
      }.bind(this)
    });


  },

  /**
   * Save model and switch to normal mode
   */
  saveModel : function () {
    this.$error.text('');

    var
      json = this.$pre.text(),
      old;

    try {
      json = JSON.parse(json);

      this.$btn.save.hide();
      this.$btn.edit.show();
      this.$btn.cancel.hide();

      this.$pre.attr('contenteditable', 'false');

      //this.model.set(json);
      old = this.model.attributes;
      if(!this.updateModel(old, json)) return;

      this.model.sync('update', this.model, {
        error : function () {
          this.model.set(old);
          this.render();
          this.$error.text('Cannot save document');
        }.bind(this)
      });
    } catch (err) {
      this.$error.text(err);
    }
  },

  /**
   * Update model with only new fields
   * @param  {Object} old    Old object
   * @param  {Object} recent New object
   * @return {Boolean}       if model was updated
   */
  updateModel : function (old, recent) {
    var dif = helpers.difference(old, recent);

    if(!_.isEmpty(dif)) {
      this.model.set(dif);
      return true;
    }

    return false;
  },

  /**
   * Cancel editing (discard changes)
   */
  cancelEdit : function () {
    this.render();

    this.$btn.save.hide();
    this.$btn.edit.show();
    this.$btn.cancel.hide();
  }
});

app.ModelsView = Backbone.View.extend({
  el : $('#results'),

  initialize : function (options) {
    options = options || {};

    this.limit = +window.app.limit || 10;
    this.page = +options.page;
    options.limit = this.limit;
    this.collection = new app.Models([], options);

    var that = this;
    this.collection.fetch({
      data :  {
        page  : this.page,
        limit : this.limit
      },

      success : function () {
        that.render();
      }
    });
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item, i) {
      this.renderItem(item, (this.page - 1) * this.limit + (i+1));
    }.bind(this), this);

    return this;
  },

  renderItem : function (item, i) {
    var modelView = new app.ModelView({
      model : item,
      index : i
    });

    this.$el.append(modelView.render().el);
  }
});


module.exports = app;
