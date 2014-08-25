/**
 * Parse(link) model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/manage/api/parse',


  /*initialize : function () {
    this.urlRoot = this.url() + '/' + this.get('_id');
  },*/

  runUrl : function () {
    return this.urlRoot + '/' + this.get('id') + '/run';
  },

  /**
   * Return true when parse is valid(when url is present) and vice versa
   * @return {Boolean} is parse valid
   */
  isValid : function () {
    var url = this.get('url');

    return url.length && url.match(/http:\/\//);
  },

  parse : function (response) {
    response.id = response._id;
    delete response._id;

    return response;
  }
});
