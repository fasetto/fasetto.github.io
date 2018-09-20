
var csso = require('gulp-csso');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');

gulp.task('styles', () => {
    return gulp.src('./_site/assets/css/**/*.css')
        .pipe(csso())
        .pipe(gulp.dest('./_site/assets/css'))
});

gulp.task('scripts', () => {
    return gulp.src('./_site/assets/js/src/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./_site/assets/js/src/'))
});

gulp.task('pages', () => {
    return gulp.src(['./_site/**/*.html'])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('./_site/'));
});

gulp.task('images', () => {
    return gulp.src(['./_site/assets/images/**/*'])
        .pipe(imagemin())
        .pipe(gulp.dest('./_site/assets/images/'));
});


// Gulp task to minify all files
gulp.task('default', () => {
  runSequence(
    'styles',
    'scripts',
    'pages',
    'images'
  );
});
