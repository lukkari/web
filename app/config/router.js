/**
 * Router configuration
 */

var express = require('express');
var config  = require('./config');

// Load routes
var home = require('../routes/');
var user  = require('../routes/user');
var manage = require('../routes/manage');

var api = {
  home : require('../routes/api/home'),
  manage : require('../routes/api/manage'),
  user : require('../routes/api/user')
};


function securityHeaders(req, res, next) {
  // https://www.owasp.org/index.php/REST_Security_Cheat_Sheet#Send_security_headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'deny');
  next();
}

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
  res.redirect('/u/login');
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

function setCache(res, val) {
  if(!val) return res.set('Cache-Control', 'no-cache');
  res.set('Cache-Control', 'public, max-age=' + val)
}

function setShortCacheHeader(req, res, next) {
  setCache(res, config[req.app.get('env')].cache.day);
  next();
}

function setLongCacheHeader(req, res, next) {
  setCache(res, config[req.app.get('env')].cache.month);
  next();
}

// Set up router
module.exports = function (passport) {

  /**
   * ===========================================================
   * API set up
   *   1) Manage API
   *   2) Home API
   *   3) User API
   */

  /**
   * Manage API
   */
  var manageApiRouter = express.Router();
  manageApiRouter
    .use(ensureAuthenticatedAPI)
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

    .get('/message',    api.manage.getMessages)
    .get('/serverdata', api.manage.getServerData);

  /**
   * Home API
   */
  var apiRouter = express.Router();
  apiRouter
    .use(ensureXhr)
    .post('/message', api.home.sendMsg)

    .get('/schedule/:q/now', api.home.getNowSchedule)
    // For some API methods set cache header
    // Schedule pages use short
    .use(setShortCacheHeader)
    .get(  '/schedule/:q', api.home.getSchedule)
    // Categories use long
    .use(setLongCacheHeader)
    .get('/groups',   api.home.getGroups)
    .get('/teachers', api.home.getTeachers)
    .get('/rooms',    api.home.getRooms)
    .get('*',         api.home.notFound)

  /**
   * User API
   */
  var userApiRouter = express.Router();
  userApiRouter
    .use(ensureAuthenticatedAPI)
    .get(   '/schedule',      api.user.getSchedule)
    .get(   '/schedule/now',  api.user.getNowSchedule)
    .delete('/subject/:id',   api.user.removeSubject)
    .post(  '/subject/:id',   api.user.addSubject)
    .get(   '/subject',       api.user.findSubject)
    .get(   '/usertable',     api.user.getUserTable)
    .delete('/usertable/:id', api.user.removeFromUserTable);

  /**
   * =====================================================
   * Page set up
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
    .get('/*', manage.index);

  /**
   * User page
   */
  var userRouter = express.Router();
  userRouter
    // Log in
    .get( '/login', user.login)
    .post('/login',
      passport.authenticate('local', {
        successRedirect: '/my',
        failureRedirect: '/u/login?wrong'
      })
    )

    // Sign up
    .get( '/signup', user.signup)
    .post('/signup', user.create)

    // When user logged
    .use(ensureAuthenticated)
    .get( '/',       user.me)
    .post('/',       user.update)
    .get( '/group',  user.selectGroup)
    .post('/group',  user.addGroup)
    .get('/logout',  user.logout);

  /**
   * Home page
   */
  var homeRouter = express.Router();
  homeRouter
    .use(setLongCacheHeader)
    // Main page
    .get('/*',      home.index);


  /**
   * ==================================================
   * Add all routers to the main router
   */

  var router = express.Router();

  router
    .use(securityHeaders)
    .use('/manage/api', manageApiRouter)
    .use('/manage',     manageRouter)
    .use('/u',          userRouter)
    .use('/api/user',   userApiRouter)
    .use('/api',        apiRouter)
    .use('/',           homeRouter);

  return router;
};
