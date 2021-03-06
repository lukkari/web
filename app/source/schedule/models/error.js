/**
 * Error model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  defaults : {
    title : 'How did you get here?',
    content : 'Looks like you found unknown place',
    isUnathorized : false
  },

  fromXHR : function (xhr) {
    xhr = xhr || {};

    this.set('status', xhr.status);
    this.set('title', xhr.statusText);

    var content = xhr.responseText;
    if(content && content.error) content = content.error;
    this.set('content', content.toString());

    if(this.get('status') == 401) this.set('isUnathorized', true);
  }
});
