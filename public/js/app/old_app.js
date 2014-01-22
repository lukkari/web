var WeekDay = Backbone.Model.extend({
  defaults   : {
    week     : '',
    weekday  : '',
    date : {
      day   : '',
      month : ''
    },
    error    : {
      code : '',
      msg  : ''
    },
    subjects : []
  }
});

var Week = Backbone.Collection.extend({
  model : WeekDay,
  url   : '/api/schedule/',

  initialize : function (options) {
    options || (options = {});
    this.url += options.url;

    console.log('go');
    return this.fetch();
  }
});

var WeekDayView = Backbone.View.extend({
  tagName   : 'div',
  className : 'bwrap',
  template  : [
    $('#weekDayNotFound').html(),
    $('#weekDayError').html(),
    $('#weekdayTemplate').html()
  ],

  render    : function () {
    var tmpl;

    switch(this.model.attributes.error.code) {
      case '404':
        tmpl = this.template[0];
        break;
      case '500':
        tmpl = this.template[1];
        break;
      default:
        tmpl = this.template[2];
    }

    tmpl = _.template(tmpl);

    this.$el.html(tmpl(this.model.toJSON()));
    return this;
  }
});

var WeekView = Backbone.View.extend({
  el  : $('#days'),

  initialize : function () {
    this.collection = new Week({ url : this.id });
    this.render();
  },

  render : function () {
    var that = this;
    this.$el.empty();
    _.each(this.collection.models, function (item) {
      that.renderWeekDay(item);
    }, this);
  },

  renderWeekDay : function (item) {
    var weekDayView = new WeekDayView({
      model: item
    });
    console.log(this.collection);
    this.$el.append(weekDayView.render().el);
  }

});

var Router = Backbone.Router.extend({
  routes : {
    ':search' : 'doSearch'
  }
});

var router = new Router();
router.on('route:doSearch', function (search) {
  var schedule = new WeekView({ id : search });
});

Backbone.history.start();


/*var schedule = new WeekView();

console.log(schedule);*/