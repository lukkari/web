/**
 * Search filter view
 */

var _ = require('underscore');
var Backbone = require('backbone');

var templates = require('../dist');

module.exports = Backbone.View.extend({
  template : templates.searchfilter,

  tagName : 'li',

  events : {
    'change input' : 'toggleCheckbox'
  },

  render : function () {
    var data = this.model.toTemplate();
    var tmpl = _.template(this.template, { variable : 'data' });

    if(data.checked) this.sendEvent(true);

    this.$el.html(tmpl(data));

    return this;
  },

  toggleCheckbox : function (e) {
    this.sendEvent(e.target.checked);
  },

  sendEvent : function (isChecked) {
    var eventName = isChecked ? 'selectedFilter' : 'hiddenFilter';
    this.model.updateState(isChecked);
    this.trigger(eventName, this.model.get('_id'));
  }
});
