/**
 * Page model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/manage/api/model/{name}/config',

  initialize : function (name, query) {
    name = name || '';

    this.urlRoot = this.urlRoot.replace('{name}', name);

    if(Object.getOwnPropertyNames(query).length) {
      this.urlRoot = this.urlRoot + '?q=' + query;
    }
  }
});
