var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify');

var production = (process.env.NODE_ENV === 'production');

var paths = {
  watch : './app/source/**/*.js',

  builds : [
    './app/source/manage/*.js',
    './app/source/schedule/*.js'
  ],

  dest : './app/public/js/builds/'
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

gulp.task('watch', ['scripts'], function () {
  var watcher = gulp.watch(paths.watch, ['scripts']);
  watcher.on('change', function (event) {
      console.log('File ' + event.path + ' was ' + event.type + ', building scripts...');
  });
});

gulp.task('default', ['scripts', 'watch']);
