;(function ($) {

  var viewHelper = {
    toUrl : function (name) {
      return encodeURIComponent(name.replace(/\s/g, '_').toLowerCase());
    }
  };

  window.app = window.app || {};

  window.app.Subject = Backbone.Model.extend({
    url : '/api/subject/',

    initialize : function (options) {
      this.url = this.url + encodeURIComponent(options.url);
    }
  });

  window.app.SubjectView = Backbone.View.extend({
    el : $('.subjectpage article'),
    template : $('#subjectTemplate').html(),

    initialize : function (options) {
      this.model = new app.Subject({ url : options.url });

      var that = this;
      this.model.fetch({
        success : function () {
          that.render();
        }
      });
    },

    render : function () {
      var tmpl = _.template(this.template),
          data = this.model.toJSON();

      _.extend(data, viewHelper);
      this.$el.html(tmpl(data));

      return this;
    }
  });

})(jQuery);
