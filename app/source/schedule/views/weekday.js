/**
 * Week day view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

var viewHelper = require('../util/weekdayview');

module.exports = Backbone.View.extend({
  tagName   : 'div',
  className : 'bwrap',
  template  : templates.weekday,

  initialize : function (options) {
    //this.editable = options.editable;
  },

  render : function () {

    var data = this.model.toJSON();

    var prev    = null,
        subjects = [];

    _.each(data.subjects, function(el) {
      if(prev) {
        var date  = new Date(el.days[0].date),
            pdate = new Date(prev.date),
            dur   = date.getHours() - pdate.getHours() - prev.duration;

        if(dur > 0) {
          subjects.push({
            rest     : true,
            days     : [{
              duration : dur,
              date : new Date(date.getFullYear(),
                              date.getMonth(),
                              date.getDate(),
                              pdate.getHours() + prev.duration,
                              15
                             )
            }]
          });
        }
      }

      subjects.push(el);
      prev = el.days[0];
    });

    data.subjects = subjects;

    _.extend(data, viewHelper);

    this.$el.html(_.template(this.template,
                             data,
                             { variable : 'data' }));

    return this;
  }
});
