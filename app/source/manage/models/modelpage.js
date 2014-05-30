/**
 * Model page model
 */

var Backbone = require('backbone');


module.exports = Backbone.Model.extend({
  urlRoot : '',

  initialize : function (name) {
    name = name || '';

    this.urlRoot = '/manage/api/model/' + name + '/config';
  }
});
