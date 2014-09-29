/**
 * Schedule model
 *   includes week number, current group/teacher/room
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/api/schedule/',

  defaults : {
    extraClass : '',
    title : '',
    switcher : ''
  },

  initialize : function (data, options) {
    options = options || {};
    this.urlRoot += options.url;
    this.set('extraClass', options.extraClass || '');
  },

  getDays : function () {
    return this.get('weekdays');
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

  getTitle : function () {
    return this.get('title');
  },

  isEditable : function () {
    return this.get('title') == 'My schedule';
  }
});
