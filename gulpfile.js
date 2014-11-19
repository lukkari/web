/**
 * Gulp tasks
 */

var gulp       = require('gulp');
var browserify = require('gulp-browserify');
var uglify     = require('gulp-uglify');
var jade       = require('gulp-jade');
var minifyCSS  = require('gulp-minify-css');
var rename     = require('gulp-rename');
var fs         = require('fs');
var path       = require('path');

var paths = {
  watch : './app/source/**/*.js',

  builds : {
    src : './app/source/{page}/{page}page.js',
    dest : './app/public/js/builds/'
  },

  templates : {
    jade : {
      src  : './app/source/{page}/templates/*.jade',
      dest : './app/source/{page}/dist/'
    },

    html : {
      src  : './app/source/{page}/dist/',
      dest : './app/source/{page}/dist/index.js'
    }
  },

  css : {
    src  : './app/public/stylesheets/*.css',
    dest : './app/public/stylesheets/'
  },

  pages : ['schedule', 'manage', 'user']
};

/**
 * transform way (change {page} to correct page name)
 * @param  {String} page Page name
 * @param  {String} way  Path
 * @return {String}      Correct way
 */
function tWay(page, way) {
  return way.replace(/\{page\}/ig, page);
}


/**
 * Build js files from the source folder
 */
gulp.task('scripts', function () {

  paths.pages.forEach(function (page) {
    gulp
    .src(tWay(page, paths.builds.src))
    .pipe(browserify({ debug : true }))
    .pipe(gulp.dest(paths.builds.dest));
  });
});


/**
 * Same as `scripts`, but minified versions
 */
gulp.task('min-js', function () {
  paths.pages.forEach(function (page) {
    gulp
    .src(tWay(page, paths.builds.src))
    .pipe(browserify({ debug : false }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.builds.dest));
  });
});


/**
 * Compile jade templates into html
 */
gulp.task('jade', function () {

  paths.pages.forEach(function (page) {
    gulp
    .src(tWay(page, paths.templates.jade.src))
    .pipe(jade({}))
    .pipe(gulp.dest(tWay(page, paths.templates.jade.dest)));
  });
});


/**
 * Add all html files into one browserifyable
 */
gulp.task('templates', function () {

  paths.pages.forEach(function (page) {

    var
      source = tWay(page, paths.templates.html.src),
      dest = tWay(page, paths.templates.html.dest);

    fs.readdir(source, function (err, files) {
      if(err) {
        console.log(err);
        return;
      }

      var templates = {},
          dir, val;

      files.forEach(function (filename) {
        if(filename.indexOf('.html') === -1) {
          // work with directory
          return;
        }

        dir = path.normalize(source + filename);
        val = fs.readFileSync(dir, 'utf8');
        templates[filename.slice(0, filename.indexOf('.'))] = val;
      });

      dir = path.normalize(dest);

      fs.writeFileSync(dir, 'module.exports = ' + JSON.stringify(templates) + ';');
      console.log('templates file was built (' + dir +')');
    });

  });
});


/**
 * Watch file changes and execute `scripts` task
 */
gulp.task('watch', ['scripts'], function () {
  var watcher = gulp.watch(paths.watch, ['scripts']);
  watcher.on('change', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', building scripts...');
  });
});


/**
 * Execute `scripts` and then `watch`
 */
gulp.task('default', ['scripts', 'watch']);


/**
 * Minify css files
 */
gulp.task('min-css', function () {
  gulp.src(paths.css.src)
    .pipe(minifyCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.css.dest));
});
