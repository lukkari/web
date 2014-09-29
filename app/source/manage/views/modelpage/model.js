/**
 * Model view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

var util = require('../../util');

module.exports = Backbone.View.extend({
  tagName   : 'li',
  className : 'row',
  template  : templates.model,

  events : {
    'click .edit'   : 'editModel',
    'click .delete' : 'deleteModel',
    'click .save'   : 'saveModel',
    'click .cancel' : 'cancelEdit'
  },

  initialize : function (options) {
    options = options || {};

    this.index = +options.index || 1;
    this.model = options.model;
  },

  render : function () {
    var
      data = {
        model : JSON.stringify(this.model.toJSON(), null, '  '),
        index : this.index
      },
      tmpl = _.template(this.template, { variable : 'data' });

    this.$el.html(tmpl(data));

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

      old = this.model.attributes;
      if(!this.updateModel(old, json)) return;

      this.model.sync('update', this.model, {
        error : (function () {
          this.model.set(old);
          this.render();
          this.$error.text('Cannot save document');
        }).bind(this)
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
    var dif = util.difference(old, recent);

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
