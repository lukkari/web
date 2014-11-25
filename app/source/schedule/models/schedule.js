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

  userUrl : '/api/user/schedule/',

  defaults : {
    title       : '',
    switcherUrl : '',
    isNow       : false
  },

  initialize : function (data, options) {
    options = options || {};
    if(options.isMy) this.urlRoot = this.userUrl;
    else this.urlRoot += options.query + '/';

    if(options.isNow) this.urlRoot += 'now';
    else this.urlRoot += '?w=' + options.week;

    this.on('sync', this.setWeek, this);
  },

  getDefaults : function (isNow) {
    var add = '/now';
    if(isNow) add = '';

    var url = this.get('url');
    if(!url || !url.length) url = this.get('title').toUrl();

    return {
      title       : this.get('title'),
      switcherUrl : url + add,
      isNow       : !!isNow
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
