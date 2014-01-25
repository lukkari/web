var routes = require('../routes/'),
    users  = require('../routes/users'),
    api    = require('../routes/api');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  if(req.originalUrl.indexOf('manage')) {
    routes.index(req, res);
    return;
  }
  res.set('X-Auth-Required', 'true');
  //res.redirect('/login/?returnTo=' + encodeURIComponent(req.originalUrl));
  res.redirect('/login');
}

module.exports = function (app, passport) {

  // Parse page
  app.get(   '/parse',       routes.parse);
  app.post(  '/parse/add',   routes.addParse);
  app.post(  '/parse/staff', routes.staffParse);
  app.get(   '/parse/:id',   routes.runParse);
  app.delete('/parse/:id',   routes.deleteParse);
  app.put(   '/parse/:id',   routes.clearParse);


  // Manage page
  app.get('/manage*', ensureAuthenticated);
  app.get('/manage',  routes.manage);
  app.get('/manage/clear/:model', routes.clearModel);

  // Log in
  app.get( '/login', users.init);
  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

  // Sign up
  app.get( '/signup', users.signup);
  app.post('/signup', users.create);

  // Log out
  app.get('/logout', users.logout);

  // User page
  app.all('/u*', ensureAuthenticated);
  app.get('/u',  users.me);

  // "API"
  app.get(' /api*',             ensureAuthenticated);
  app.get( '/api/groups',       api.getGroups);
  app.get( '/api/teachers',     api.getTeachers);
  app.get( '/api/schedule*', api.getSchedule);
  app.post('/api/messages',     api.sendMsg);

  // Main page
  app.get('/*',    routes.index);
};