/**
 * Filter model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/manage/api/filter',

  isValid : function () {
    var name = this.get('name');

    return name && (name.length >= 2);
  },

  parse : function (response) {
    response.id = response._id;
    delete response._id;

    return response;
  }
});
