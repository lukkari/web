var express = require('express'),
    routes = require('../routes/'),
    users  = require('../routes/users'),
    api    = require('../routes/api'),
    manage = require('../routes/manage');


function handleManage(req, res) {
  if(req.originalUrl.indexOf('manage') !== -1) {
    routes.index(req, res);
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

function ensureAdmin(req, res, next) {
  if(req.user.roles.admin) return next();

  if(handleManage(req, res)) return;

  res.set('X-Auth-Required', 'true');
  //res.redirect('/login/?returnTo=' + encodeURIComponent(req.originalUrl));
  res.redirect('/login');
}

function ensureXhr(req, res, next) {
  //if(!req.xhr) return res.json({ error : 'Only xhr requests' });

  /**
   * For CORS
   *
  res.header('Access-Control-Allow-Origin',  req.headers.origin || "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
   */

  next();
}

// Set up router
module.exports = function (app, passport) {

  var manageRouter = express.Router();
  manageRouter
    .use(ensureAuthenticated)
    .use(ensureAdmin)

    .get('/',             manage.index)
    .get('/log',          manage.showLog)
    .get('/model/:model', manage.model)
    .get('/model/:model/page/:page', manage.model)
    .get('/clear/:model', manage.clearModel)

    .get( '/parse',       manage.parse)
    .post('/parse/add',   manage.addParse)
    .post('/parse/staff', manage.staffParse)

    .get(   '/parse/:id',   manage.runParse)
    .delete('/parse/:id',   manage.deleteParse)
    .put(   '/parse/:id',   manage.clearParse)

    .post('/building', manage.addBuilding);

  var manageApiRouter = express.Router();
  manageApiRouter
    .use(ensureAuthenticated)
    .use(ensureAdmin)
    .use(ensureXhr)

    .get('/model/:model/config', manage.apiModelConfig)
    .get('/model/:model', manage.apiModel);

  var userRouter = express.Router();
  userRouter
    // User page
    .use(ensureAuthenticated)
    .get( '/',       users.me)
    .post('/',       users.update)
    .get( '/group', users.selectGroup)
    .post('/group', users.addGroup)

    // Log out
    .get('/logout', users.logout);


  var apiRouter = express.Router();
  apiRouter
    // "API"
    .use(ensureXhr)
    .get(   '/groups',          api.getGroups)
    .get(   '/teachers',        api.getTeachers)
    .get(   '/rooms',           api.getRooms)
    .get(   '/schedule/:q',     api.getSchedule)
    .get(   '/schedule/now/:q', api.getNow)
    .post(  '/messages',        api.sendMsg)
    .get(   '/subject/:q',      api.getSubject)
    .delete('/subject/:q',      api.removeSubject)
    .post(  '/subject/:q',      api.addSubject)
    .get(   '/subject/short/:q',api.getSubjects)
    .get(   '*',                api.notFound);

  // Experiments
  //app.get('/editor', ensureAuthenticated);
  //app.get('/editor', routes.editor);

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

    // Main page
    .get('/:q/now', routes.getNow)
    .get('/*',      routes.index);

  // Add all routers
  app
    .use('/manage', manageRouter)
    .use('/manage/api', manageApiRouter)
    .use('/u', userRouter)
    .use('/api', apiRouter)
    .use('/', homeRouter);
};
