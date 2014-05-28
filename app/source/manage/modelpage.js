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
      /**
       * @type {Array} this.models Array of objects:
       *   {
       *     @type {String} model model name
       *     @type {Object} view link to saved PageView
       *   }
       */
      this.models = [];
    },

    /**
     * Checks if this.models has model page
     * @param  {String} name model name
     * @return {Object} return found object or undefined
     */
    has : function (name) {
      name = name || '';

      var found = _.find(this.models,
        function (el) {
          return el.model === name;
        }
      );
      return found;
    },

    /**
     * Adds object to this.models variable
     * @param {String} data { model name, page view }
     */
    add : function (data) {
      if(typeof data === 'object') this.models.push(data);
      return data;
    },

    getPage : function (name, p) {
      if(!name || !name.length) return;
      p = p || '1'; // page number

      var content = this.has(name);
      if(content) {
        content.view.load(p);
      } else {
        content = new page.PageView({
          name : name,
          page : p
        });

        this.add({
          model : name,
          view  : content
        });
      }
    }
  });

  window.app = {
    router : new app.Router(),
    limit  : 5
  };
  Backbone.history.start({ pushState: true });


  /**
   * Page events
   */

  $(document).on('click', 'a[data-local]', function (e) {
    var href = $(this).attr('href');
    var protocol = this.protocol + '//';

    if(href.slice(protocol.length) !== protocol) {
      e.preventDefault();
      window.app.router.navigate(href, true);
    }
  });

});
