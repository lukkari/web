/**
 * Message model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  /**
   * Add new field and decode message
   * @param  {Object} response Message object(attributes)
   * @return {Object}          Modified object
   */
  parse : function (response) {
    response.date = new Date(response.createdAt).toGMTString();
    response.message = decodeURIComponent(response.message);

    return response;
  }
});
