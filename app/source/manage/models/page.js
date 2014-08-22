/**
 * Page model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/manage/api/model/{name}/config',

  initialize : function (name) {
    name = name || '';

    this.urlRoot = this.urlRoot.replace('{name}', name);
  }
});
