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
  Apps = require('./collections/apps'),

  AppView = require('./views/app'),

  DashboardView  = require('./views/dashboard'),
  SectionView    = require('./views/dashboard/section'),
  ServerDataItemView = require('./views/dashboard/serverdataitem'),
  ModelBlockView = require('./views/dashboard/modelblock'),
  MessageView    = require('./views/dashboard/message'),

  AppsPageView = require('./views/apps'),
  AddAppView = require('./views/apps/add'),
  AppListView = require('./views/apps/list'),

  ModelPageView = require('./views/modelpage');

module.exports = Backbone.Router.extend({
  routes : {
    'model/:m(/page/:p)(/)' : 'modelPage',
    'apps' : 'appsPage',
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
   * Show applications page
   */
  appsPage : function () {
    if(this.view) this.view.remove();

    var apps = new Apps();
    apps.fetch();

    var addAppView = new AddAppView();
    addAppView.on('new_app', function (app) {
      apps.add(app, { at : 0 });
    });

    this.view = new AppsPageView({
      subviews : {
        addApp : addAppView,
        appList : new AppListView({
          collection : apps
        })
      }
    });

    this.app.toContent(this.view.render().el);
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
