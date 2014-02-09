var routes = require('../routes/'),
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

module.exports = function (app, passport) {

  // Manage page
  app.all('/manage*',             ensureAuthenticated);
  app.all('/manage*',             ensureAdmin);
  app.get('/manage',              manage.index);
  app.get('/manage/log',          manage.showLog);
  app.get('/manage/clear/:model', manage.clearModel);

  app.get(   '/manage/parse',       manage.parse);
  app.post(  '/manage/parse/add',   manage.addParse);
  app.post(  '/manage/parse/staff', manage.staffParse);

  app.get(   '/manage/parse/:id',   manage.runParse);
  app.delete('/manage/parse/:id',   manage.deleteParse);
  app.put(   '/manage/parse/:id',   manage.clearParse);

  app.post('/manage/building', manage.addBuilding);

  // Log in
  app.get( '/login', users.login);
  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login?wrong'
    })
  );

  // Sign up
  app.get( '/signup',       users.signup);
  app.post('/signup',       users.create);

  // Log out
  app.get('/logout', users.logout);

  // User page
  app.all( '/u*',      ensureAuthenticated);
  app.get( '/u',       users.me);
  app.post('/u',       users.update);
  app.get( '/u/group', users.selectGroup);
  app.post('/u/group', users.addGroup);

  // "API"
  app.all('/api*', function(req, res, next) {
    if(!req.xhr) return res.json('Only xhr requests');

    /**
     * For CORS
     *
    res.header('Access-Control-Allow-Origin',  req.headers.origin || "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
     */

    next();
  });
  app.get( '/api/groups',          api.getGroups);
  app.get( '/api/teachers',        api.getTeachers);
  app.get( '/api/schedule/:q',     api.getSchedule);
  app.get( '/api/schedule/now/:q', api.getNow);
  app.post('/api/messages',        api.sendMsg);
  app.get( '/api/subject/:q',      api.getSubject);

  // Experiments
  app.get('/editor', ensureAuthenticated);
  app.get('/editor', routes.editor);

  // Main page
  app.get('/:q/now', routes.getNow);
  app.get('/*',      routes.index);
};
