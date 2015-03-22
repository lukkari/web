/**
 * App model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/manage/api/app',

  isValid : function () {
    var name = this.get('name');

    return name && (name.length >= 2);
  },

  parse : function (response) {
    response.id = response._id;
    delete response._id;    
    response.lastAccessed = new Date(response.lastAccessed).toString();

    return response;
  }
});
