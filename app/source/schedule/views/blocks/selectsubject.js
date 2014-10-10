var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

module.exports = Backbone.View.extend({

  template  : templates.selectsubject,
  className : 'absolute-block',

  events : {
    'click #closeBlockBtn' : 'hide',
    'keyup #searchSubject' : 'searchSubject',
    'click #subjects > li' : 'addSubject'
  },

  initialize : function () {
    this.collection.on('sync', this.renderSubjects, this);
  },

  render : function () {
    this.$el.html(_.template(this.template, { variable : 'data' }));
    this.renderSubjects();

    return this;
  },

  renderSubjects : function () {
    var $subjects = this.$el.find('#subjects');
    $subjects.empty();
    _.each(this.collection.models, function (item) {
      $subjects.append('<li data-id="' + item.get('_id') + '">' + item.get('name') + '</li>');
    });
    return this;
  },

  renderItem : function (item) {
    return this;
  },

  show : function () {
    this.$el.fadeIn('fast');
  },

  hide : function () {
    this.$el.fadeOut('fast');
  },

  searchSubject : function (e) {
    var text = this.$el.find(e.target).val();

    if(!text.length) return;

    this.collection.getSubjects(text);
  },

  addSubject : function (e) {
    var id = this.$el.find(e.target).attr('data-id');

    var model = this.collection.findById(id);
    model.addToPlan(this);
  }

});
