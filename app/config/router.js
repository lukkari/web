/**
 * Router configuration
 */

var
  express = require('express'),
  config  = require('./config'),

  // Load routes
  home = require('../routes/'),
  users  = require('../routes/users'),
  manage = require('../routes/manage'),

  api = {
    home : require('../routes/api/home'),
    manage : require('../routes/api/manage'),
    user : require('../routes/api/user')
  };

function handleManage(req, res) {
  if(req.originalUrl.indexOf('manage') !== -1) {
    home.index(req, res);
    return true;
  }

  return false;
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  if(handleManage(req, res)) return;

  res.set('X-Auth-Required', 'true');
  //res.redirect('/login/?returnTo=' + encodeURIComponent(req.originalUrl));
  res.redirect('/login');
}

function ensureAuthenticatedAPI(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.set('X-Auth-Required', 'true');
  res.status(401).send('Authentication is required');
}

function ensureAdmin(req, res, next) {
  if(req.user.roles.admin) return next();

  if(handleManage(req, res)) return;

  res.set('X-Auth-Required', 'true');
  //res.redirect('/login/?returnTo=' + encodeURIComponent(req.originalUrl));
  res.redirect('/login');
}

function ensureXhr(req, res, next) {
  // Requests from mobile app are not xhr, therefore don't use for now
  //if(!req.xhr) return res.send('');

  /**
   * For CORS
   *
  res.header('Access-Control-Allow-Origin',  req.headers.origin || "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
   */

  next();
}

function setCacheHeader(req, res, next) {
  // Set cache header for one day
  res.set('Cache-Control', 'public, max-age=' + config[req.app.get('env')].cache.apis);

  next();
}

// Set up router
module.exports = function (app, passport) {

  /**
   * ===========================================================
   * API setups
   *   1) Manage API
   *   2) Home API
   *   3) User API
   */

  /**
   * Manage API
   */
  var manageApiRouter = express.Router();
  manageApiRouter
    .use(ensureAuthenticated)
    .use(ensureAdmin)
    .use(ensureXhr)

    .get(   '/model/:model/config', api.manage.modelConfig)
    .get(   '/model/:model',        api.manage.model)
    .put(   '/model/:model/:id',    api.manage.editModel)
    .delete('/model/:model/:id',    api.manage.deleteModel)

    .get('/model', api.manage.getModels)

    .get(   '/parse',         api.manage.getParses)
    .post(  '/parse',         api.manage.addParse)
    .get(   '/parse/:id/run', api.manage.runParse)
    .delete('/parse/:id',     api.manage.deleteParse)

    .get('/message', api.manage.getMessages)
    .get('/serverdata', api.manage.getServerData)

    // TO DO: remove
    .get('/parse/test', api.manage.testParse);

  /**
   * Home API
   */
  var apiRouter = express.Router();
  apiRouter
    .use('/wakeup', api.home.wakeup) // wake up app heroku hack
    .get('/baseurl', api.home.baseurl) // return url to schedule server (for future use)

    .use(ensureXhr)
    .post(  '/message',         api.home.sendMsg)
    .get(   '/schedule/:q/now', api.home.getNow)

    .get(   '/schedule/my',     api.home.getMySchedule)
    // For some API methods set cache header
    .use(setCacheHeader)
    .get(   '/groups',          api.home.getGroups)
    .get(   '/teachers',        api.home.getTeachers)
    .get(   '/rooms',           api.home.getRooms)
    .get(   '/schedule/:q',     api.home.getSchedule)
    .get(   '*',                api.home.notFound);

  /**
   * User API
   */
  var userApiRouter = express.Router();
  userApiRouter
    .use(ensureAuthenticatedAPI)
    .delete('/subject/:id',   api.user.removeSubject)
    .post(  '/subject/:id',   api.user.addSubject)
    .get(   '/subject',       api.user.findSubject)
    .get(   '/usertable',     api.user.getUserTable)
    .delete('/usertable/:id', api.user.removeFromUserTable);

  /**
   * =====================================================
   * Page setups
   *   1) Manage page
   *   2) User page
   *   3) Home page
   */

  /**
   * Manage page
   */
  var manageRouter = express.Router();
  manageRouter
    .use(ensureAuthenticated)
    .use(ensureAdmin)

    .get('/parser', manage.index)
    .get('/log',    manage.showLog)

    .get('/*', manage.index);

  /**
   * User page
   */
  var userRouter = express.Router();
  userRouter
    .use(ensureAuthenticated)
    .get( '/',       users.me)
    .post('/',       users.update)
    .get( '/group',  users.selectGroup)
    .post('/group',  users.addGroup)

    .get('/logout',  users.logout);

  /**
   * Home page
   */
  var homeRouter = express.Router();
  homeRouter
    // Log in
    .get( '/login', users.login)
    .post('/login',
      passport.authenticate('local', {
        successRedirect: '/my',
        failureRedirect: '/login?wrong'
      })
    )

    // Sign up
    .get( '/signup', users.signup)
    .post('/signup', users.create)

    .use(setCacheHeader)
    // Main page
    .get('/*',      home.index);


  /**
   * ==================================================
   * Add all routers to the app
   */
  app
    .use('/manage/api', manageApiRouter)
    .use('/manage',     manageRouter)
    .use('/u',          userRouter)
    .use('/api/user',   userApiRouter)
    .use('/api',        apiRouter)
    .use('/',           homeRouter);
};
