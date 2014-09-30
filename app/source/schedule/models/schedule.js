/**
 * Schedule model
 *   includes week number, current group/teacher/room
 */

var Backbone = require('backbone');

var Week = require('../collections/week');

module.exports = Backbone.Model.extend({
  urlRoot : '/api/schedule/',

  week : null,
  isEditing : false,

  defaults : {
    extraClass : '',
    title : '',
    switcher : ''
  },

  initialize : function (data, options) {
    options = options || {};
    this.urlRoot += options.url;
    this.set('extraClass', options.extraClass || '');

    this.on('sync', this.setWeek, this);
  },

  getDefaults : function (isNow) {
    var add = '/now';

    if(isNow) add = '';

    return {
      extraClass : this.get('extraClass'),
      title : this.get('title'),
      switcher : this.get('title').toUrl() + add
    };
  },

  isEditable : function () {
    return this.get('title') == 'My schedule';
  },

  setWeek : function () {
    this.week = new Week(this.get('weekdays'));
    this.unset('weekdays');
    // When subject is removed from the week,
    // or added update schedule
    this.week.on('change', this.fetch, this);
  },

  getWeek : function () {
    return this.week;
  }
});
