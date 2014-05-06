var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify');

gulp.task('scripts', function () {
   gulp
    .src('./app/source/manage/modelpage.js')
    .pipe(browserify())
    //.pipe(uglify())
    .pipe(gulp.dest('./app/public/js/builds/'));
});

gulp.task('watch', function () {
  gulp.watch('./app/source/manage/*.js', ['scripts']);
  gulp.watch('./app/source/manage/*/*.js', ['scripts']);
});
