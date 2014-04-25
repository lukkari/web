;(function ($) {

  window.app = window.app || {};

  window.app.ItemLink = Backbone.Model.extend({
  });

  window.app.GroupList = Backbone.Collection.extend({
    model : app.ItemLink,
    url   : '/api/groups',

    search : function (letters) {
      if(letters == "") return this.models;

      var pattern = new RegExp(letters, "gi");
      return this.filter(function(data) {
        return data.get("name").match(pattern);
      });
    }
  });

  window.app.TeacherList = Backbone.Collection.extend({
    model : app.ItemLink,
    url   : '/api/teachers',

    search : function (letters) {
      if(letters == "") return this.models;

      var pattern = new RegExp(letters, "gi");
      return this.filter(function(data) {
        return data.get("name").match(pattern);
      });
    }
  });

  window.app.ItemLinkView = Backbone.View.extend({
    tagName   : 'ul',
    template  : $('#itemlinkTemplate').html(),

    render : function () {
      var tmpl = _.template(this.template);

      var data = this.model.toJSON();
      data.tourl = data.name.toLowerCase().replace(/\s/g, "_");
      this.$el.html(tmpl(data));
      return this;
    }
  });

  window.app.ListView = Backbone.View.extend({

    template : $('#listTemplate').html(),

    events : {
      'click a'     : 'closeList',
      'keyup .text' : 'searchFilter'
    },

    initialize : function (options) {
      options || (options = {});

      switch (options.list) {
        case 'group' :
          this.collection = new app.GroupList();
          break;
        case 'teacher' :
          this.collection = new app.TeacherList();
          break;
        default:
          return;
      }

      this.title = options.list;

      var that = this;
      this.collection.fetch({
        success : function () {
          that.render();
        }
      });
    },

    render : function () {
      var that = this;

      var tmpl = _.template(this.template);
      this.$el.html(tmpl({ title : this.title }));

      _.each(this.collection.models, function (item) {
        that.renderItem(item);
      }, this);

      return this;
    },

    renderList : function (data) {
      data || (data = []);

      var that = this;

      this.$el.children('.list').empty();
      _.each(data, function (item) {
        that.renderItem(item);
      }, this);

      return this;
    },

    renderItem : function (item) {
      var itemLinkView = new app.ItemLinkView({
        model: item
      });
      this.$el.children('.list').append(itemLinkView.render().el);
    },

    closeList : function (e) {
      app.sideBar.close();
    },

    searchFilter : function (e) {
      var letters = this.$el.find('.text').val();
      this.renderList(this.collection.search(letters));
    }
  });

})(jQuery);
