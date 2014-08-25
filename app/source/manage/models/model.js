/**
 * Model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  initialize : function () {
    this.urlRoot = this.url() + '/' + this.attributes._id;
  },

  /**
   * Remove not important info from the object
   * @param  {[type]} response [description]
   * @return {[type]}          [description]
   */
  parse : function (response) {
    //delete response.__v;

    return response;
  }
});
