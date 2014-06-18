/**
 * Manage page router
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var
  ModelBlocks = require('./collections/modelblocks'),

  SetionView = require('./views/section'),
  AppView = require('./views/app'),
  ManagePageView = require('./views/managepage'),
  ModelView = require('./views/model');

module.exports = Backbone.Router.extend({
  routes : {
    'model/:m(/page/:p)(/)' : 'modelPage',
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

    // Save current view
    this.view = null;

    // Init app view
    this.app = new AppView({
      el : '#app'
    });
    this.app.render();
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
      content = new ModelView({
        name : name,
        page : p
      });

      this.add({
        model : name,
        view  : content
      });
    }
  },

  /**
   * Show main page
   */
  mainPage : function () {

    if(this.view) this.view.remove();

    var modelblocks = new ModelBlocks();

    modelblocks.fetch({
      success : (function () {
        this.view = new ManagePageView({
          subviews : {
            modelblocks : new Section({
              title : 'Database models',
              className : 'models',
              collection : modelblocks
            })
          }
        });
        this.app.assign(this.view, '#content');
      })
    });
  }
});
