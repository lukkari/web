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

    var tmpl = _.template(this.template),
        data = this.model.toJSON();

    var prev    = null,
        subjects = [];
    data.subjects.forEach(function (e) {
      if(prev) {
        var date  = new Date(e.days[0].date),
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

      subjects.push(e);
      prev = e.days[0];
    });

    data.subjects = subjects;
    data.editable = this.editable;

    _.extend(data, viewHelper);

    this.$el.html(tmpl(data));
    return this;
  }
});
