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

  initialize : function (options) {},

  render : function () {

    var data = this.model.toJSON();

    var prev    = null,
        subjects = [],
        date, pdate, dur;

    _.each(data.subjects, function(el) {
      if(prev) {
        date  = new Date(el.date),
        pdate = new Date(prev.date),
        dur   = date.getHours() - pdate.getHours() - prev.duration;

        if(dur > 0) {
          subjects.push({
            rest     : true,
            duration : dur,
            date : new Date(date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            pdate.getHours() + prev.duration,
                            15
                           )
          });
        }
      }

      subjects.push(el);
      prev = el;
    });

    data.subjects = subjects;

    _.extend(data, viewHelper);

    this.$el.html(_.template(this.template,
                             data,
                             { variable : 'data' }));

    return this;
  }
});
