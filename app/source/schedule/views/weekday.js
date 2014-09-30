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

  events : {
    'click #removeBtn' : 'removeSubject'
  },

  initialize : function (options) {},

  render : function () {

    var data = this.model.toJSON();
    var tmpl = _.template(this.template, { variable : 'data' });

    var prev    = null,
        subjects = [],
        date, pdate, dur;

    _.each(data.subjects, function(el, index) {
      if(index === 0) {
        // Add block with starting time
        date = new Date(el.date);

        subjects.push({
            timeBlock : true,
            date : new Date(date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            date.getHours(),
                            15
                           )
          });
      }

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

    if(prev) {
      // Add block with ending time
      pdate = new Date(prev.date);
      date = pdate;

      subjects.push({
        timeBlock : true,
        duration  : 0,
        date : new Date(date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        pdate.getHours() + prev.duration,
                        0
                       )
      });
    }

    data.subjects = subjects;

    _.extend(data, viewHelper);

    this.$el.html(tmpl(data));

    return this;
  },

  removeSubject : function (e) {
    var subject_id = this.$el.find(e.target).attr('data-subject');
  }
});
