/* jshint node:true */

'use strict';

var fs = require('fs'),
    path = require('path'),
    wiredep = require('wiredep'),
    olive = require('olive'),
    oliveOptions = olive.getOptions();

function getFiles() {
  var wiredepOptions = {
    dependencies: true,
    devDependencies: true,
    directory: JSON.parse(fs.readFileSync('.bowerrc')).directory
  };

  // bower js files and application js file
  return wiredep(wiredepOptions).js
    .concat([
      path.join(oliveOptions.paths.tmp, 'js/appinfo.js'),
      path.join(oliveOptions.paths.src, 'app/**/*.js'),
      path.join(oliveOptions.paths.src, '**/*.html')
    ]);
}

module.exports = function(config) {

  var karmaConfig = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'angular-filesort'],

    // further narrow the subset of files via karma-angular-filesort
    angularFilesort: {
      whitelist: [path.join(oliveOptions.paths.src, '/**/!(*.html|*.spec|*.mock).js')]
    },

    // list of files / patterns to load in the browser
    files: getFiles(),

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: oliveOptions.paths.src + '/app/',
      moduleName: 'app'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'mocha', 'html', 'coverage'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    // generate code coverage using Istanbul
    // https://github.com/karma-runner/karma-coverage
    coverageReporter: {
      type : 'html',
      dir : 'coverage'
    },

    // web server port
    port: oliveOptions.ports.karma,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  };

  // preprocessor for converting HTML files to AngularJS templates.
  karmaConfig.preprocessors[oliveOptions.paths.src + '/**/*.html'] = ['ng-html2js'];

  // source files, that you wanna generate coverage for
  // do not include tests or libraries
  // (these files will be instrumented by Istanbul)
  karmaConfig.preprocessors[oliveOptions.paths.src + '/**/*.js'] = ['coverage'];

  config.set(karmaConfig);
};
