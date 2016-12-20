var gulp       = require('gulp');
var plumber    = require('gulp-plumber');
var babel = require('gulp-babel');
var fs = require('fs');

var paths = {
    scripts: ['!./node_modules/**', 'lib/**/*.js'],
    spec: ['spec/**/*.js'],
};

gulp.task('node-babel', ['copy:init'], function () {
    return gulp.src(paths.scripts)
		.pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('node-babel-spec', function () {
    return gulp.src(paths.spec)
		.pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist-spec'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    //gulp.watch("./lib/**", ["node-babel"]);
    gulp.watch("./spec/**", ["node-babel-spec"]);
});


gulp.task('default', ['node-babel-spec', 'watch']);
