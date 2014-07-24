/**
 * Parse(link) model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/manage/api/parse',

  runUrl : function () {
    return this.urlRoot + '/' + this.get('_id') + '/run';
  }
});
