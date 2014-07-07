var
  gulp       = require('gulp'),
  browserify = require('gulp-browserify'),
  uglify     = require('gulp-uglify'),
  jade       = require('gulp-jade'),
  fs         = require('fs'),
  path       = require('path');

var production = (process.env.NODE_ENV === 'production');

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

  pages : ['schedule', 'manage']
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

gulp.task('scripts', function () {

  paths.pages.forEach(function (page) {
    gulp
    .src(tWay(page, paths.builds.src))
    .pipe(browserify({ debug : true }))
    //.pipe(uglify())
    .pipe(gulp.dest(tWay(page, paths.builds.dest)));
  });
});

gulp.task('jade', function () {

  paths.pages.forEach(function (page) {
    gulp
    .src(tWay(page, paths.templates.jade.src))
    .pipe(jade({}))
    .pipe(gulp.dest(tWay(page, paths.templates.jade.dest)));
  });
});

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

gulp.task('watch', ['scripts'], function () {
  var watcher = gulp.watch(paths.watch, ['scripts']);
  watcher.on('change', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', building scripts...');
  });
});

gulp.task('default', ['scripts', 'watch']);
