/**
 * Manage page router
 */

var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    mvc = require('./modelpage/model-mvc'),
    page = require('./modelpage/page');


module.exports = Backbone.Router.extend({
  routes : {
    'model/:m(/page/:p)' : 'modelPage',
    '*' : 'mainPage'
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

  modelPage : function (name, p) {
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
  },

  mainPage : function () {

  }
});
