/**
 * Router
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var
  AppView = require('./views/app'),
  ParserPageView = require('./views/parserpage');


module.exports = Backbone.Router.extend({
  routes : {
    ''               : 'parser',
    '*other'         : 'unknown'
  },

  initialize : function () {
    /**
     * Saves last page view
     */
    this.view = null;
    /**
     * Initalize appview
     */
    this.app = new AppView({
      el : '#app'
    });
    this.app.render();
  },

  /**
   * Show parser page
   */
  parser : function () {

    if(this.view) this.view.remove();

    this.view = new ParserPageView();
    this.app.toContent(this.view.render().el);
  }
});
