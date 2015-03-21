/**
 * Manage page router
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Page = require('./models/page'),

  ServerData  = require('./collections/serverdata'),
  ModelBlocks = require('./collections/modelblocks'),
  Messages    = require('./collections/messages'),

  AppView = require('./views/app'),

  DashboardView  = require('./views/dashboard'),
  SectionView    = require('./views/dashboard/section'),
  ServerDataItemView = require('./views/dashboard/serverdataitem'),
  ModelBlockView = require('./views/dashboard/modelblock'),
  MessageView    = require('./views/dashboard/message');

  ModelPageView = require('./views/modelpage');

module.exports = Backbone.Router.extend({
  routes : {
    'model/:m(/page/:p)(/)' : 'modelPage',
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

    var page = new Page(name);


    page.fetch({
      success : (function () {
        this.view = new ModelPageView({
          name : name,
          page : p,
          model : page
        });

        this.app.toContent(this.view.render().el);
      }).bind(this)
    });
  },

  /**
   * Show dashboard page
   */
  dashboard : function () {
    if(this.view) this.view.remove();

    var
      serverData = new ServerData(),
      modelBlocks = new ModelBlocks(),
      messages = new Messages();

    this.view = new DashboardView({
      subviews : {
        serverdata : new SectionView({
          title : 'Server data',
          className : 'server-data',
          collection : serverData,
          ModelView : ServerDataItemView
        }),

        modelblocks : new SectionView({
          title : 'Database models',
          className : 'models',
          collection : modelBlocks,
          ModelView : ModelBlockView
        }),

        messages : new SectionView({
          title : 'Messages',
          className : 'messages',
          collection : messages,
          ModelView : MessageView
        })
      }
    });

    this.app.toContent(this.view.render().el);
  }
});
