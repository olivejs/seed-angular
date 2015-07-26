/* jshint node:true, latedef:false */

'use strict';

var fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    $ = require('gulp-load-plugins')(),
    wiredep = require('wiredep').stream,
    browserSync = require('browser-sync'),
    del = require('del'),
    karma = require('karma');

/**
 * Ginger configuration
 */
var config = JSON.parse(fs.readFileSync('.gingerrc'));

/**
 * Inject Content-Security-Policy meta tag
 */
function injectCSP() {
  var env = process.env.NODE_ENV;
  var injectCSPOptions = {
    starttag: '<!-- inject:csp -->',
    transform: function(filePath, file) {
      var gingerrcJSON = JSON.parse(file.contents.toString('utf8'));
      if (!gingerrcJSON.hasOwnProperty('content-security-policy')) { return; }
      var csp = gingerrcJSON['content-security-policy'];
      if (!csp.hasOwnProperty(env)) { return; }
      var meta = '<meta http-equiv="Content-Security-Policy" content="';
      var contents = [];
      Object.keys(csp[env]).forEach(function(directive) {
        var source = csp[env][directive];
        contents.push(directive + ' ' + source);
      });
      meta += contents.join('; ') + '">';
      return meta;
    }
  };
  return $.inject(gulp.src(['.gingerrc']), injectCSPOptions);
}

/**
 * Inject @imports and compile Sass
 */
gulp.task('styles', function() {
  var sassOptions = {
    outputStyle: 'expanded'
  };

  var sassFiles = gulp.src([
    path.join(config.paths.src, 'app/**/*.scss'),
    path.join('!' + config.paths.src, 'app/styles/**/*.scss')
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(config.paths.src + '/app/', '../');
      return '@import "' + filePath + '";';
    },
    addRootSlash: false,
    starttag: '// inject:scss',
    endtag: '// endinject'
  };

  return gulp.src(
    path.join(config.paths.src, 'app/styles/app.scss'))
    .pipe($.inject(sassFiles, injectOptions))
    .pipe(wiredep())
    .pipe($.sass(sassOptions)).on('error', errorHandler('Sass'))
    .pipe(gulp.dest(path.join(config.paths.tmp, 'css')));
});

/**
 *
 */
gulp.task('scripts', function() {
  return gulp.src(path.join(config.paths.src, 'app/**/*.js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

/**
 * Inject stylesheets into `bower:css` and `inject:css`
 * and scripts into ...
 */
gulp.task('inject', ['styles', 'scripts'], function() {
  var cssFiles = gulp.src([
    path.join(config.paths.tmp, 'css/**/*.css')
  ], { read: false });

  var jsFiles = gulp.src([
    path.join(config.paths.src, 'app/**/*.js'),
    path.join('!' + config.paths.src, 'app/**/*.spec.js')
  ], { read: false });

  // make the path relative
  var injectOptions = {
    ignorePath: [path.join(config.paths.src, 'app'), config.paths.tmp],
    addRootSlash: false
  };

  return gulp.src(path.join(config.paths.src, '*.html'))
    .pipe(injectCSP())
    .pipe($.inject(cssFiles, injectOptions))  // inject:css
    .pipe($.inject(jsFiles, injectOptions))   // inject:js
    .pipe(wiredep())                          // bower:css
    .pipe(gulp.dest(config.paths.tmp));

  /* Important: While using both, `wiredep` should always run after `inject` in the pipe */
});

/**
 * Watch for changes
 */
gulp.task('watch', ['inject'], function() {

  // Watch for change in the root htmls (i.e. index.html) or in bower.json
  gulp.watch([path.join(config.paths.src, '*.html'), 'bower.json'], ['inject', browserSync.reload]);

  // Watch for change in sass
  gulp.watch(path.join(config.paths.src, 'app/**/*.scss'), function(event) {
    if (event.type === 'changed') {
      gulp.start('styles', browserSync.reload);
    } else {
      gulp.start('inject', browserSync.reload);
    }
  });

  // Watch for change in scripts
  gulp.watch(path.join(config.paths.src, 'app/**/*.js'), function(event) {
    if (event.type === 'changed') {
      gulp.start('scripts', browserSync.reload);
    } else {
      gulp.start('inject', browserSync.reload);
    }
  });

  // Watch for change in the html templates
  gulp.watch([path.join(config.paths.src, 'app/**/*.html')], function(event) {
    browserSync.reload(event.path);
  });

});

/**
 * Serve via Browsersync
 */
gulp.task('serve', ['setenv:development', 'clean:tmp', 'watch'], function() {
  browserSync.init({
    server: {
      baseDir: [config.paths.tmp, path.join(config.paths.src, 'assets'), path.join(config.paths.src, 'app')],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

/**
 * Test
 */
gulp.task('test', function() {
  karma.server.start({
    configFile: path.join(__dirname, 'karma.conf.js'),
    autoWatch: true,
    singleRun: false,
  });
});

/**
 * Delete tmp directory
 */
gulp.task('clean:tmp', function() {
  del.sync([config.paths.tmp]);
});

/**
 * Delete dist directory
 */
gulp.task('clean:dist', function() {
  del.sync([config.paths.dist]);
});

/**
 * Delete both tmp and dist directories
 */
gulp.task('clean', function() {
  del.sync([config.paths.tmp, config.paths.dist]);
});

/**
 * Set environment to development
 */
gulp.task('setenv:development', function() {
  process.env.NODE_ENV = 'development';
});

/**
 * Set environment to production
 */
gulp.task('setenv:production', function() {
  process.env.NODE_ENV = 'production';
});

/**
 * Convert all angular html templates into a javascript template cache
 */
gulp.task('templates', function() {
  return gulp.src(path.join(config.paths.src, 'app/**/*.html'))
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache({
      module: 'application'
    }))
    .pipe(gulp.dest(path.join(config.paths.tmp, 'js')));
});

/**
 * Build app html, css and js files
 */
gulp.task('app', ['inject', 'templates'], function() {
  var templateFiles = gulp.src(path.join(config.paths.tmp, 'js/templates.js'), { read: false });
  var injectOptions = {
    starttag: '<!-- inject:templates -->',
    ignorePath: config.paths.tmp,
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html');
  var cssFilter = $.filter('**/*.css');
  var jsFilter = $.filter('**/*.js');
  var assets = $.useref.assets();

  return gulp.src(path.join(config.paths.tmp, '*.html'))
    .pipe(injectCSP())
    .pipe($.inject(templateFiles, injectOptions))
    .pipe(assets)
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify().on('error', errorHandler('Uglify')))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({
      processImport: false,
      keepSpecialComments: false
    }))
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(config.paths.dist))
    .pipe($.size({
      title: config.paths.dist,
      showFiles: true
    }));
});

/**
 * Copy content of the assets directory
 */
gulp.task('assets', function() {
  return gulp.src(path.join(config.paths.src, 'assets/**/*'))
    .pipe(gulp.dest(config.paths.dist));
});

/**
 * Build task
 */
gulp.task('build', [
  'setenv:production',
  'clean',
  'app',
  'assets'
]);

/**
 * Default task
 */
gulp.task('default', [
  'build'
]);

/**
 * Common implementation for an error handler of a gulp plugin
 * @param  {String}   title Short description of the error
 * @return {Function}       Callback function
 */
function errorHandler(title) {
  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
}
