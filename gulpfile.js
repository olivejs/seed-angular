/* jshint node: true */

'use strict';

var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    config = require('./gulp/config.json');

gulp.task('wiredep', function() {
  gulp.src('./src/index.html')
    .pipe(wiredep())
    .pipe(gulp.dest(config.paths.tmp));
});

// Default task
gulp.task('default', ['wiredep']);
