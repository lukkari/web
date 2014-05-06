var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    mvc = require('./modelpage/model-mvc'),
    page = require('./modelpage/page');

$(function () {

  var app = app || {};

  app.Router = Backbone.Router.extend({
    routes : {
      'manage/model/:m(/page/:p)' : 'getPage'
    },

    initialize : function () {
      this.pages = [];
      this.config = null;
    },

    /**
     * Checks if this.pages has entry with the same params
     * @param  {Object} params object with name and page
     * @return {Object} return found object or undefined
     */
    has : function (params) {
      params = params || {};

      var found = _.find(this.pages,
        function (el) {
          return _.isEqual(el.params, params);
        }
      );
      return found;
    },

    add : function (content) {
      if(typeof content === 'object') this.pages.push(content);
      return content;
    },

    getPage : function (name, p) {
      if(!name || !name.length) return;
      p = p || '1'; // page number

      //if(!this.config) this.getConfig(name);

      var params = {
        name : name,
        page : p
      };
      this.page = new page.PageView(params);

      var content = this.has(params);
      if(content) {
        content.data.render();
      } else {
        content = new mvc.ModelsView(params);
        this.add({
          params : params,
          data   : content
        });
      }
    },

    /**
     * Load config for current model
     * @param  {String} name model name
     */
    getConfig : function (name) {
      $.get('/manage/api/model/'+name+'/config', function (data) {
        this.config = data;

      }.bind(this));
    }
  });

  app.router = new app.Router();
  Backbone.history.start({ pushState: true });


  /**
   * Page events
   */

  $(document).on('click', 'a[data-local]', function (e) {
    var href = $(this).attr('href');
    var protocol = this.protocol + '//';

    if(href.slice(protocol.length) !== protocol) {
      e.preventDefault();
      app.router.navigate(href, true);
    }
  });

});
