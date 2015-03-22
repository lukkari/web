/**
 * Week day model
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  /**
   * Return this model with break entries,
   * starting day and ending day entries
   * @return {Object} this model
   */
  withBreaks : function () {
    var
      data = this.toJSON(),
      subjects = [],
      prev = null,
      date, pdate, dur;

    _.each(data.subjects, function (el, i) {
      if(i === 0) {
        // Add starting day block
        subjects.push(this.timeBlock(el.date.start, true));
      }

      if(prev) {
        // Try to fit rest block between subjects
        pdate = new Date(prev.date.end);
        date = new Date(el.date.start);
        dur = date.getHours() - pdate.getHours();
        if(dur > 0) {
          subjects.push(this.restBlock(prev.date.end, el.date.start));
        }
      }

      subjects.push(el);
      prev = el;

      if(i === data.subjects.length - 1) {
        // Ending day block
        subjects.push(this.timeBlock(el.date.end, false));
      }
    }, this);

    data.subjects = subjects;

    return data;
  },

  /**
   * Return time block
   * @param  {Date}  date        Date object
   * @param  {Boolean} isMorning
   * @return {Object}
   */
  timeBlock : function (date, isMorning) {
    date = new Date(date);
    return {
      timeBlock : true,
      date : {
        start : new Date(date.getFullYear(),
                         date.getMonth(),
                         date.getDate(),
                         date.getHours(),
                         isMorning ? 15 : 0
                        )
      }
    };
  },

  /**
   * Return rest block
   * @param  {Date}  pend Previous block ending date
   * @param  {Date}  date Current block starting date
   * @return {Object}
   */
  restBlock : function (pend, cstart) {
    pend = new Date(pend);
    cstart = new Date(cstart);
    return {
      rest : true,
      date : {
        start : new Date(pend.getFullYear(),
                         pend.getMonth(),
                         pend.getDate(),
                         pend.getHours(),
                         0
                       ),
        end : new Date(cstart.getFullYear(),
                       cstart.getMonth(),
                       cstart.getDate(),
                       cstart.getHours(),
                       0
                      )
      }
    };
  },

  removeBySubjectId : function (subjectId) {
    if(!subjectId) return this;

    this.deleteSubject(subjectId, (function (data) {
      var filteredArr = _.filter(this.get('subjects'), function (subject) {
        if(subject.subject) return subject.subject._id !== subjectId;
        return false;
      });

      this.set('subjects', filteredArr);
    }).bind(this));

    return this;
  },

  deleteSubject : function (subjectId, cb) {
    Backbone.$.ajax({
      url : '/api/user/subject/' + subjectId,
      type : 'DELETE'
    })
      .done(function (data) {
        cb(data);
      })
      .fail(function (data) {
        console.log('fail');
      });
  }

});
