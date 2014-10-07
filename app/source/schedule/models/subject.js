/**
 * Subject model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  addToPlan : function (view) {
    this.postData(this.get('_id'), function () {
      if(view) {
        view.hide();
        // Trigger schedule update request
        view.trigger('updateSchedule');
      }

    });
  },

  postData : function (subjectId, cb) {
    Backbone.$.ajax({
      url : '/api/user/subject/' + subjectId,
      type : 'POST'
    })
      .done(function (data) {
        cb(data);
      })
      .fail(function (data) {
        console.log('fail');
      });
  },

  removeFromPlan : function () {

  }

});
