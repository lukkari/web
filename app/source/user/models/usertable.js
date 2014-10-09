/**
 * UserTable model
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var Subjects = require('../collections/subjects');

module.exports = Backbone.Model.extend({
  urlRoot : '/api/user/usertable',

  sections : {},
  sectionNames : ['added', 'removed'],

  initialize : function () {
    _.each(this.sectionNames, function (section) {
      this.sections[section] = new Subjects([]);
    }, this);

    this.on('sync', this.updateProps, this);
  },

  updateProps : function () {
    _.each(this.sections, function (section, key) {
      section.set(this.get(key));
      this.unset(key);
    }, this);
  }
});
