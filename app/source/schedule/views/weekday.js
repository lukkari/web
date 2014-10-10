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

  render : function () {
    var data = this.model.withBreaks();
    var tmpl = _.template(this.template, { variable : 'data' });

    _.extend(data, viewHelper);
    this.$el.html(tmpl(data));

    return this;
  },

  removeSubject : function (e) {
    var subjectId = this.$el.find(e.target).attr('data-subject');
    this.model.removeBySubjectId(subjectId);
  }
});
