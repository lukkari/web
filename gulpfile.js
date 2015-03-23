/**
 * Gulp tasks
 */

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jade = require('gulp-jade');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var fs = require('fs');
var path = require('path');
var del = require('del');
// var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
// var watchify = require('watchify');
var browserify = require('browserify');
var transform = require('vinyl-transform');

var paths = {

  jade : {
    src : './app/source/{page}/templates/*.jade',
    dest : './app/source/{page}/dist/'
  },

  html : {
    src  : './app/source/{page}/dist/',
    dest : './app/source/{page}/dist/index.js'
  },

  scripts : {
    src : './app/source/{page}/{page}page.js',
    dest : './app/public/js/builds/'
  },

  watch : './app/source/**/*.js',

  css : {
    src  : './app/public/stylesheets/*.css',
    dest : './app/public/stylesheets/'
  },

  minjs : {
    src : './app/public/js/**/*.js',
    dest : './app/public/js/'
  },

  clean : {
    all : [
      './app/public/js/builds/*.js',
      './app/public/js/builds/*.js.map',
      './app/public/js/**/*.min.js',
      './app/source/*/dist/*',
      './app/public/stylesheets/*.min.css'
    ],
    js : [
      './app/public/js/builds/*.js',
      './app/public/js/builds/*.js.map',
      './app/public/js/**/*.min.js'
    ],
    minjs : [
      './app/public/js/**/*.min.js'
    ],
    css : [
      './app/public/stylesheets/*.min.css'
    ]
  },

  pages : ['schedule', 'manage', 'user']
};

/**
 * Get page path (change {page} to correct page name)
 * @param  {String} page Page name
 * @param  {String} dir  Path
 * @return {String}      Correct dir
 */
function getDir(page, dir) {
  return dir.replace(/\{page\}/ig, page);
}

/**
 * Return array with script name prepending page names
 *   Ex: ('jade', ['schedule', 'user']) -> ['jade-schedule', 'jade-user']
 *
 * @param {String} name
 * @param {Array} pages Page names
 */
function nameWithPages(name, pages) {
  return pages.map(function (page) {
    return name + '-' + page;
  });
}

/**
 * Get page name from task name
 * 	Ex: ('jade-schedule') -> 'schedule'
 *
 * @param {String} taskName
 */
function findPageName(taskName) {
  return taskName.split('-')[1];
}


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
 * Jade templates
 */
var jadeTasks = nameWithPages('jade', paths.pages);

gulp.task('jade', jadeTasks);

jadeTasks.forEach(function (task) {

  var pageName = findPageName(task);
  var src = getDir(pageName, paths.jade.src);
  var dest = getDir(pageName, paths.jade.dest);

  gulp.task(task, function () {
    return gulp
      .src(src)
      .pipe(jade({}))
      .pipe(gulp.dest(dest));
  });

});

/**
 * Combine templates into one file for each page
 */
var templateTasks = nameWithPages('templates', paths.pages);

gulp.task('templates', templateTasks);

templateTasks.forEach(function (task) {

  var pageName = findPageName(task);
  var src = getDir(pageName, paths.html.src);
  var dest = getDir(pageName, paths.html.dest);

  gulp.task(task, ['jade-' + pageName], function (cb) {

    fs.readdir(src, function (err, files) {
      if(err) {
        console.log(err);
        return;
      }

      var templates = {};
      var dir = path.normalize(dest);

      files.forEach(function (filename) {
        if(filename.indexOf('.html') === -1) {
          // work with directory
          return;
        }

        var dir = path.join(src, filename);
        var val = fs.readFileSync(dir, 'utf8');
        templates[filename.slice(0, filename.indexOf('.'))] = val;
      });

      fs.writeFileSync(dir, 'module.exports = ' + JSON.stringify(templates) + ';');

      return cb();
    });

  });

});


/**
 * Build js files for each page
 */
var scriptTasks = nameWithPages('scripts', paths.pages);

gulp.task('scripts', scriptTasks);

scriptTasks.forEach(function (task) {

  var pageName = findPageName(task);
  var src = getDir(pageName, paths.scripts.src);
  var dest = getDir(pageName, paths.scripts.dest);

  // transform regular node stream to gulp (buffered vinyl) stream
  var browserified = transform(function(filename) {
    var b = browserify({ entries: filename, debug: true });
    return b.bundle();
  });

  gulp.task(task, ['templates-' + pageName], function () {
    return gulp
      .src(src)
      .pipe(browserified)
      .pipe(sourcemaps.init({loadMaps: true}))
          // Add transformation tasks to the pipeline here.
          .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dest));
  });

});


/**
 * Clean from all builds
 */
gulp.task('clean', function (cb) {
  del(paths.clean.all, cb);
});

gulp.task('clean-css', function (cb) {
  del(paths.clean.css, cb);
});

gulp.task('clean-js', function (cb) {
  del(paths.clean.js, cb);
});

gulp.task('clean-min-js', function (cb) {
  del(paths.clean.minjs, cb);
});


/**
 * Minify js files
 */
gulp.task('min-js', ['clean-min-js', 'scripts'], function () {
  return gulp
    .src(paths.minjs.src)
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.minjs.dest));
});


/**
 * Minify css files
 */
gulp.task('min-css', ['clean-css'], function () {
  return gulp.src(paths.css.src)
    .pipe(minifyCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.css.dest));
});


/**
 * Build for production
 */
gulp.task('prod', ['min-css', 'min-js']);
