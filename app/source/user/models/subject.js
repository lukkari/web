/**
 * Subject model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/api/user/usertable',
  urlUpdated : false,

  defaults : {
    _id : '0'
  },

  initialize : function () {
    this.set('id', this.get('_id'));
  }
});
