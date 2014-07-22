/**
 * Manage page router
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var
  ModelBlocks = require('./collections/modelblocks'),

  Parses = require('./collections/parses'),

  AppView = require('./views/app'),

  DashboardView = require('./views/dashboard'),
  SectionView = require('./views/dashboard/section'),
  ModelBlockView = require('./views/dashboard/modelblock'),

  ModelPageView = require('./views/modelpage'),

  ParserView = require('./views/parser');

module.exports = Backbone.Router.extend({
  routes : {
    'model/:m(/page/:p)(/)' : 'modelPage',
    'parser' : 'parser',
    '/*' : 'dashboard'
  },

  initialize : function () {
    // Save current view
    this.view = null;

    // Init app view
    this.app = new AppView({
      el : '#app'
    });
    this.app.render();
  },

  /**
   * Show model page
   * @param  {String} name Model name
   * @param  {String]} p   Page number
   */
  modelPage : function (name, p) {
    if(!name || !name.length) return;
    p = p || '1'; // page number

    if(this.view) this.view.remove();

    this.view = new ModelPageView({
      name : name,
      page : p
    });

    this.app.assign(this.view, '#content');
  },

  /**
   * Show parser page
   */
  parser : function () {
    console.log('parser');
    if(this.view) this.view.remove();

    var parses = new Parses();

    parses.fetch({
      success : (function () {
        this.view = new ParserView({
          parses : parses
        });

        this.app.toContent(this.view.render().el);
      }).bind(this)
    });
  },

  /**
   * Show dashboard page
   */
  dashboard : function () {
    console.log('dashboard');
    if(this.view) this.view.remove();

    var modelblocks = new ModelBlocks();

    modelblocks.fetch({
      success : (function () {
        this.view = new DashboardView({
          subviews : {
            modelblocks : new SectionView({
              title : 'Database models',
              className : 'models',
              collection : modelblocks,
              ModelView : ModelBlockView
            })
          }
        });

        this.app.toContent(this.view.render().el);
      }).bind(this)
    });
  }
});
