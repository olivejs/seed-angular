/* jshint node:true, latedef:false */

'use strict';

var path = require('path'),
    _ = require('lodash'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    chokidar = require('chokidar'),
    wiredep = require('wiredep').stream,
    browserSync = require('browser-sync'),
    del = require('del'),
    karma = require('karma'),
    tinylr = require('tiny-lr')(),
    opn = require('opn'),
    olive = require('olive'),
    options = olive.getOptions(),
    $ = require('gulp-load-plugins')({
      pattern: ['gulp-*', 'main-bower-files']
    });

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
    reporters: singleRun ? ['mocha', 'coverage'] : ['html']
  }, done);
}

/**
 * Debounced method to reload the unit test report page
 * @param  {String} path Relative path to the changed file
 */
var reloadTestReport = _.debounce(_reloadTestReport, 50);
function _reloadTestReport(path) {
  tinylr.changed({
    body: {
      files: [path]
    }
  });
}

/**
 * Debounced method to reload the browser
 * @param  {String} path Relative path to the changed file
 */
var reloadBrowser = _.debounce(_reloadBrowser, 50);
function _reloadBrowser(path) {
  browserSync.reload(path);
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
    .pipe($.sourcemaps.init())
    .pipe($.sass(sassOptions)).on('error', errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
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

  // Watch for changes in the root htmls (i.e. index.html) and in bower.json
  chokidar.watch([path.join(options.paths.src, '*.html'), 'bower.json']).on('change', function(_path) {
    gulp.start('inject', function() {
      reloadBrowser(_path);
      reloadTestReport(_path);
    });
  });

  // Watch for changes in all files inside the assets directory
  chokidar.watch(path.join(options.paths.src, 'assets')).on('all', function(event, _path) {
    reloadBrowser(_path);
  });

  // Watch for changes in scss/js/html files inside app directory
  chokidar.watch(path.join(options.paths.src, 'app')).on('all', function(event, _path) {
    var ext = path.extname(_path);

    // Watch for change in `app/**/*.scss`
    if (ext === '.scss') {
      if (event === 'change') {
        gulp.start('styles', function() {
          reloadBrowser(_path);
        });
      } else {
        gulp.start('inject', function() {
          reloadBrowser(_path);
        });
      }
    }

    // Watch for changes in `app/**/*.js`
    else if (ext === '.js') {
      if (event === 'change') {
        gulp.start('scripts', function() {
          reloadBrowser(_path);
          reloadTestReport(_path);
        });
      } else {
        gulp.start('inject', function() {
          reloadBrowser(_path);
          reloadTestReport(_path);
        });
      }
    }

    // Watch for change in `app/**/*.html`
    else if (ext === '.html') {
      reloadBrowser(_path);
      reloadTestReport(_path);
    }

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
    notify: false,
    logLevel: 'silent'
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
    .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
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
 * Copy fonts from bower dependencies to dist/fonts
 * Note: Custom fonts are handled by `assets` task
 */
gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(options.paths.dist, 'fonts')));
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
  'fonts',
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
