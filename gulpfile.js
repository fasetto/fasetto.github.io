
var csso = require('gulp-csso');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');

gulp.task('styles', function () {
    return gulp.src('./_site/assets/css/**/*.css')
        .pipe(csso())
        .pipe(gulp.dest('./_site/assets/css'))
});

gulp.task('scripts', function () {
    return gulp.src('./_site/assets/js/src/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./_site/assets/js/src/'))
});

gulp.task('pages', function () {
    return gulp.src(['./_site/**/*.html'])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('./_site/'));
});


// Gulp task to minify all files
gulp.task('default', function () {
  runSequence(
    'styles',
    'scripts',
    'pages'
  );
});
