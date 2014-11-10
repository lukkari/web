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
        subjects.push(this.timeBlock(el.date, true));
      }

      if(prev) {
        // Try to fit rest block between subjects
        date = new Date(el.date);
        pdate = new Date(prev.date);
        dur = date.getHours() - pdate.getHours() - prev.duration;

        if(dur > 0) subjects.push(this.restBlock(date, pdate, dur, prev.duration));
      }

      subjects.push(el);
      prev = el;

      if(i === data.subjects.length - 1) {
        // Ending day block: add last class duration to it
        date = (new Date(el.date)).getTime() + (el.duration * 60 * 60 * 1000);
        subjects.push(this.timeBlock(date, false));
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
      date : new Date(date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      date.getHours(),
                      isMorning ? 15 : 0
                     )
    };
  },

  /**
   * Return rest block
   * @param  {Date}    date
   * @param  {Date}    pdate
   * @param  {Integer} dur
   * @param  {Integer} pdur
   * @return {Object}
   */
  restBlock : function (date, pdate, dur, pdur) {
    date = new Date(date);
    pdate = new Date(pdate);
    return {
      rest : true,
      duration : dur,
      date : new Date(date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      pdate.getHours() + pdur,
                      15
                     )
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
