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

  builds : [
    './app/source/manage/managepage.js',
    './app/source/schedule/schedulepage.js'
  ],

  dest : './app/public/js/builds/',

  templates : {
    jade : {
      src  : './app/source/schedule/templates/*.jade',
      dest : './app/source/schedule/dist/'
    },

    html : {
      src  : './app/source/schedule/dist/',
      dest : './app/source/schedule/dist/index.js'
    }
  }
};

gulp.task('scripts', function () {

  paths.builds.forEach(function (path) {

    gulp
    .src(path)
    .pipe(browserify({ debug : false }))
    //.pipe(uglify())
    .pipe(gulp.dest(paths.dest));

  });
});

gulp.task('jade', function () {
  gulp
    .src(paths.templates.jade.src)
    .pipe(jade({}))
    .pipe(gulp.dest(paths.templates.jade.dest));
});

gulp.task('templates', function () {
  fs.readdir(paths.templates.html.src, function (err, files) {
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

      dir = path.normalize(paths.templates.html.src + filename);
      val = fs.readFileSync(dir, 'utf8');
      templates[filename.slice(0, filename.indexOf('.'))] = val;
    });

    dir = path.normalize(paths.templates.html.dest);

    fs.writeFileSync(dir, 'module.exports = ' + JSON.stringify(templates) + ';');
    console.log('templates file was built (' + dir +')');
  });
});

gulp.task('watch', ['scripts'], function () {
  var watcher = gulp.watch(paths.watch, ['scripts']);
  watcher.on('change', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', building scripts...');
  });
});

gulp.task('default', ['scripts', 'watch']);
