/* jshint node:true, latedef:false */

'use strict';

var path = require('path'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    $ = require('gulp-load-plugins')(),
    wiredep = require('wiredep').stream,
    browserSync = require('browser-sync'),
    del = require('del'),
    karma = require('karma'),
    tinylr = require('tiny-lr')(),
    opn = require('opn'),
    olive = require('olive'),
    options = olive.getOptions();

/**
 * Inject Content-Security-Policy meta tag
 */
function injectCSP() {
  var env = process.env.NODE_ENV;
  var injectCSPOptions = {
    starttag: '<!-- inject:csp -->',
    transform: function() {
      if (!options.hasOwnProperty('content-security-policy')) { return; }
      var csp = options['content-security-policy'];
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
  return $.inject(gulp.src(''), injectCSPOptions);
}

/**
 * Run unit tests
 * @param  {Boolean}  singleRun If true, runs only once
 * @param  {Function} done      Callback function
 */
function runUnitTests(singleRun, done) {
  karma.server.start({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: singleRun,
    autoWatch: !singleRun,
    reporters: singleRun ? ['mocha'] : ['html']
  }, done);
}

/**
 * Inject @imports and compile Sass
 */
gulp.task('styles', function() {
  var sassOptions = {
    outputStyle: 'expanded'
  };

  var sassFiles = gulp.src([
    path.join(options.paths.src, 'app/**/*.scss'),
    path.join('!' + options.paths.src, 'app/styles/**/*.scss')
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(options.paths.src + '/app/', '../');
      return '@import "' + filePath + '";';
    },
    addRootSlash: false,
    starttag: '// inject:scss',
    endtag: '// endinject'
  };

  return gulp.src(
    path.join(options.paths.src, 'app/styles/app.scss'))
    .pipe($.inject(sassFiles, injectOptions))
    .pipe(wiredep())
    .pipe($.sass(sassOptions)).on('error', errorHandler('Sass'))
    .pipe(gulp.dest(path.join(options.paths.tmp, 'css')));
});

/**
 * Lint the scripts and report issues if any
 */
gulp.task('scripts', function() {
  return gulp.src(path.join(options.paths.src, 'app/**/*.js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

/**
 * Inject stylesheets into `bower:css` and `inject:css`
 * and scripts into `inject:js`
 */
gulp.task('inject', ['styles', 'scripts'], function() {
  var cssFiles = gulp.src([
    path.join(options.paths.tmp, 'css/**/*.css')
  ], { read: false });

  var jsFiles = gulp.src([
    path.join(options.paths.src, 'app/**/*.js'),
    path.join('!' + options.paths.src, 'app/**/*.spec.js')
  ], { read: false });

  // make the path relative
  var injectOptions = {
    ignorePath: [path.join(options.paths.src, 'app'), options.paths.tmp],
    addRootSlash: false
  };

  return gulp.src(path.join(options.paths.src, '*.html'))
    .pipe(injectCSP())
    .pipe($.inject(cssFiles, injectOptions))  // inject:css
    .pipe($.inject(jsFiles, injectOptions))   // inject:js
    .pipe(wiredep())                          // bower:css
    .pipe(gulp.dest(options.paths.tmp));

  /* Important: While using both, `wiredep` should always run after `inject` in the pipe */
});

/**
 * Watch for changes
 */
gulp.task('watch', ['inject'], function() {

  // Watch for change in the root htmls (i.e. index.html) or in bower.json
  gulp.watch([path.join(options.paths.src, '*.html'), 'bower.json'], ['inject', browserSync.reload]);

  // Watch for change in sass
  gulp.watch(path.join(options.paths.src, 'app/**/*.scss'), function(event) {
    if (event.type === 'changed') {
      gulp.start('styles', browserSync.reload);
    } else {
      gulp.start('inject', browserSync.reload);
    }
  });

  // Watch for change in scripts
  gulp.watch(path.join(options.paths.src, 'app/**/*.js'), function(event) {
    if (event.type === 'changed') {
      gulp.start('scripts', browserSync.reload);
    } else {
      gulp.start('inject', browserSync.reload);
    }

    // Signal report page to reload
    tinylr.changed({
      body: {
        files: [
          path.relative(__dirname, event.path)
        ]
      }
    });
  });

  // Watch for change in the html templates
  gulp.watch([path.join(options.paths.src, 'app/**/*.html')], function(event) {
    browserSync.reload(event.path);
  });

  // Listen to livereload update for html report page
  tinylr.listen(35729);

  // Run unit test continuously
  runUnitTests(false);

  // Open report page in browser
  opn('http://localhost:' + options.ports.karma + '/debug.html');
});

/**
 * Serve via Browsersync
 */
gulp.task('serve', ['setenv:development', 'clean:tmp', 'watch'], function() {
  var ports = options.ports || {};
  browserSync.init({
    port: ports.app || 3000,
    ui: {
      port: ports.bs || 3001
    },
    server: {
      baseDir: [options.paths.tmp, path.join(options.paths.src, 'assets'), path.join(options.paths.src, 'app')],
      routes: {
        '/bower_components': 'bower_components'
      }
    },
    notify: false
  });
});

/**
 * Run unit tests once
 */
 gulp.task('test', ['scripts'], function(done) {
   runUnitTests(true, done);
 });

/**
 * Run unit tests continuously
 */
gulp.task('test:auto', ['watch'], function() {
  runUnitTests(false);
});

/**
 * Delete tmp directory
 */
gulp.task('clean:tmp', function() {
  del.sync([options.paths.tmp]);
});

/**
 * Delete dist directory
 */
gulp.task('clean:dist', function() {
  del.sync([options.paths.dist]);
});

/**
 * Delete both tmp and dist directories
 */
gulp.task('clean', function() {
  del.sync([options.paths.tmp, options.paths.dist]);
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
  return gulp.src(path.join(options.paths.src, 'app/**/*.html'))
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache({
      module: 'application'
    }))
    .pipe(gulp.dest(path.join(options.paths.tmp, 'js')));
});

/**
 * Build app html, css and js files
 */
gulp.task('app', ['inject', 'templates'], function() {
  var templateFiles = gulp.src(path.join(options.paths.tmp, 'js/templates.js'), { read: false });
  var injectOptions = {
    starttag: '<!-- inject:templates -->',
    ignorePath: options.paths.tmp,
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html');
  var cssFilter = $.filter('**/*.css');
  var jsFilter = $.filter('**/*.js');
  var assets = $.useref.assets();

  return gulp.src(path.join(options.paths.tmp, '*.html'))
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
    .pipe(gulp.dest(options.paths.dist))
    .pipe($.size({
      title: options.paths.dist,
      showFiles: true
    }));
});

/**
 * Copy content of the assets directory
 */
gulp.task('assets', function() {
  return gulp.src(path.join(options.paths.src, 'assets/**/*'))
    .pipe(gulp.dest(options.paths.dist));
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
