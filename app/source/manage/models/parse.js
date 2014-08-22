/**
 * Parse(link) model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/manage/api/parse',

  runUrl : function () {
    return this.urlRoot + '/' + this.get('id') + '/run';
  },

  parse : function (response) {
    response.id = response._id;
    delete response._id;

    return response;
  }
});
