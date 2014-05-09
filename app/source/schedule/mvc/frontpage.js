var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

Backbone.$ = $;

var app = app || {};

app.FrontPageModel = Backbone.Model.extend({
  urlRoot : '/api/frontpage'
});

app.FrontPageView = Backbone.View.extend({
  template : $('#frontPageTemplate').html(),
  errTmpl  : $('#errorTemplate').html(),
  $parent  : $('#content'),

  initialize : function () {
    var that = this;

    this.model = new app.FrontPageModel();
    this.model.fetch({
      success : function () {
        that.render();
      },

      error : function () {
        that.handleError();
      }
    });
  },

  hide : function () {
    this.$el.hide();
    return this;
  },

  show : function () {
    this.$el.fadeIn('fast');
    return this;
  },

  render : function () {
    var tmpl = _.template(this.template);

    this
      .$el
      .html(tmpl(this.model.toJSON()))
      .fadeIn('fast');
    this.$parent.append(this.el);
    return this;
  },

  handleError : function () {
    var tmpl = _.template(this.errTmpl),
        msg  = {
          error : 'Cannot load resource, try reloading page'
        };

    this
      .$el
      .html(tmpl(msg))
      .fadeIn('fast');
    this.$parent.append(this.el);

    return this;
  }
});

module.exports = app;
