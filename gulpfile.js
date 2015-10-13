/* jshint node:true, latedef:false */

'use strict';

var pkg = require('./package.json'),
    fs = require('fs'),
    olive = require('olive'),
    path = require('path'),
    _ = require('lodash'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    chokidar = require('chokidar'),
    wiredep = require('wiredep').stream,
    browserSync = require('browser-sync'),
    modRewrite = require('connect-modrewrite'),
    del = require('del'),
    mkdirp = require('mkdirp'),
    karma = require('karma'),
    tinylr = require('tiny-lr')(),
    opn = require('opn'),
    options,
    $ = require('gulp-load-plugins')({
      pattern: ['gulp-*', 'main-bower-files']
    });

/**
 * Get node environment
 * @return {String} Environment name
 */
function getenv() {
  return process.env.NODE_ENV;
}

/**
 * Set node environment
 * @param  {String} env Environment name
 */
function setenv(env) {
  process.env.NODE_ENV = env;
  getOptions();
}

/**
 * Retrieve olive options
 */
function getOptions() {
  options = olive.getOptions();
}

/**
 * Inject Content-Security-Policy meta tag
 */
function injectCSP() {
  var env = getenv();
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
 * Inject appinfo script
 */
function injectAppInfo() {
  var injectAppInfoScriptTag = {
    starttag: '<!-- inject:appinfo -->',
    transform: function() {
      var script = '<script src="js/appinfo.js"></script>';
      return script;
    }
  };
  return $.inject(gulp.src(''), injectAppInfoScriptTag);
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
function _reloadBrowser(path, event) {
  if (event) {
    gutil.log(gutil.colors.cyan('File changed:'), gutil.colors.magenta(path));
  }
  gutil.log(gutil.colors.cyan('Reloading Browsers...'));
  browserSync.reload(path);
}

/**
 * Create `appinfo.js` file in `js` directory under tmp path
 */
gulp.task('appinfo', function() {
  var tmpJsDir = path.join(options.paths.tmp, 'js');
  var appInfoFile = path.join(tmpJsDir, 'appinfo.js');

  var appName = pkg.name,
      appVersion = pkg.version;

  var scriptContent = 'appInfo={name:"' + appName + '",version:"' + appVersion + '"};';
  mkdirp.sync(tmpJsDir);
  fs.writeFileSync(appInfoFile, scriptContent);
});

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
gulp.task('lint', function() {
  return gulp.src(path.join(options.paths.src, 'app/**/*.js'))
    .pipe($.jshint())
    .pipe($.jscs()).on('error', _.noop)
    .pipe($.jscsStylish.combineWithHintResults())
    .pipe($.jshint.reporter('jshint-stylish'));
});

/**
 * Inject stylesheets into `bower:css` and `inject:css`
 * and scripts into `inject:js`
 */
gulp.task('inject', ['styles', 'lint'], function() {
  var cssFiles = gulp.src([
    path.join(options.paths.tmp, 'css/**/*.css')
  ], { read: false });

  var jsFiles = gulp.src([
    path.join(options.paths.src, 'app/**/*.js'),
    path.join('!' + options.paths.src, 'app/**/*.spec.js')
  ])
  .pipe($.angularFilesort()).on('error', errorHandler('AngularFilesort'));

  // make the path relative
  var injectOptions = {
    ignorePath: [path.join(options.paths.src, 'app'), options.paths.tmp],
    addRootSlash: false
  };

  return gulp.src(path.join(options.paths.src, '*.html'))
    .pipe(injectCSP())                        // inject:csp
    .pipe(injectAppInfo())                    // inject:appinfo
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
  chokidar.watch([path.join(options.paths.src, '*.html'), 'bower.json'], {ignoreInitial: true}).on('change', function(_path) {
    gulp.start('inject', function() {
      reloadBrowser(_path, 'change');
      reloadTestReport(_path, 'change');
    });
  });

  // Watch for changes in all files inside the assets directory
  chokidar.watch(path.join(options.paths.src, 'assets'), {ignoreInitial: true}).on('all', function(event, _path) {
    reloadBrowser(_path, event);
  });

  // Watch for changes in scss/js/html files inside app directory
  chokidar.watch(path.join(options.paths.src, 'app'), {ignoreInitial: true}).on('all', function(event, _path) {
    var ext = path.extname(_path);

    // Watch for change in `app/**/*.scss`
    if (ext === '.scss') {
      if (event === 'change') {
        gulp.start('styles', function() {
          reloadBrowser(_path, event);
        });
      } else {
        gulp.start('inject', function() {
          reloadBrowser(_path, event);
        });
      }
    }

    // Watch for changes in `app/**/*.js`
    else if (ext === '.js') {
      if (event === 'change') {
        gulp.start('lint', function() {
          reloadBrowser(_path, event);
          reloadTestReport(_path);
        });
      } else {
        gulp.start('inject', function() {
          reloadBrowser(_path, event);
          reloadTestReport(_path);
        });
      }
    }

    // Watch for change in `app/**/*.html`
    else if (ext === '.html') {
      reloadBrowser(_path, event);
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
gulp.task('serve', ['setenv:development', 'clean:tmp', 'appinfo', 'watch'], function() {
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
      },
      middleware: [
        modRewrite(['!\\.\\w+$ /index.html [L]']),
        function (req, res, next) {
          res.setHeader('X-UA-Compatible', 'IE=Edge');
          next();
        }
      ]
    },
    notify: false,
    logLevel: 'silent'
  });
});

/**
 * Run unit tests once
 */
gulp.task('test', ['setenv:test', 'lint'], function(done) {
  runUnitTests(true, done);
});

/**
 * Run unit tests continuously
 */
gulp.task('test:auto', ['setenv:test', 'watch'], function() {
  runUnitTests(false);
});

/**
 * Delete tmp directory
 */
gulp.task('clean:tmp', function() {
  del.sync(options.paths.tmp);       // delete tmp dir
  mkdirp.sync(options.paths.tmp);    // recreate it (empty)
});

/**
 * Delete dist directory
 */
gulp.task('clean:dist', function() {
  del.sync([
    options.paths.dist + '/**/*',
    '!' + options.paths.dist + '/.gitkeep'
  ], { dot: true });
});

/**
 * Delete both tmp and dist directories
 */
gulp.task('clean', function() {
  gulp.start('clean:tmp');
  gulp.start('clean:dist');
});

/**
 * Set environment to development
 */
gulp.task('setenv:development', function() {
  setenv('development');
});

/**
 * Set environment to production
 */
gulp.task('setenv:production', function() {
  setenv('production');
});

/**
 * Set environment to test
 */
gulp.task('setenv:test', function() {
  setenv('test');
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
      module: 'app'
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
  'appinfo',
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
