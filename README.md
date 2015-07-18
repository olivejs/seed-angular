# AngularJS Seed

> Ginger seed for AngularJS - offers you quickly scaffold an AngularJS project with pragmatic defaults and best practices.

## Usage

Install gulp and bower:
```
npm install -g gulp bower
```
Clone this repo, and `cd` into it:
```
  cd <path-to-the-repo>
```
Install npm and bower dependencies:
```
  npm install && bower install
```
Run `gulp build` to build and `gulp serve` for preview. Run `gulp test` to launch the test runner. It will also generates the code coverage report in `coverage` directory.

## Directory Structure

```
├─src/
│ ├─app/
│ │ ├─components/
│ │ │ └─navbar/
│ │ │   ├─navbar.directive.js
│ │ │   ├─navbar.html
│ │ │   └─navbar.scss
│ │ ├─pods/
│ │ │ └─home/
│ │ │   ├─home.controller.js
│ │ │   ├─home.html
│ │ │   └─home.scss
│ │ ├─services/
│ │ │ └─github.service.js
│ │ ├─styles/
│ │ │ ├─_overrides.scss
│ │ │ ├─_type.scss
│ │ │ └─app.scss
│ │ └─app.js
│ ├─assets/
│ │ ├─img/
│ │ ├─fonts/
│ │ ├─apple-touch-icon.png
│ │ └─favicon.ico
│ └─index.html
├─dist/
├─.tmp/
├─bower_components/
├─node_modules/
├─.bowerrc
├─.editorconfig
├─.gitignore
├─.jshintrc
├─bower.json
├─gulpfile.js
├─package.json
└─readme.json
```

File/Directory    | Purpose
------------------|---------
src/              | Contains your Angular application code.
dist/             | Contains the distributable (that is, optimized and self-contained) output of your application. Deploy this to your server!
.tmp/             | Various temporary output of build steps, as well as the debug output of your application.
bower_components/ |	Bower dependencies.
node_modules      | Node modules required for development purpose.
.bowerrc          | Bower configuration.
.editorconfig     | EditorConfig file.
.gingerrc         | Ginger configuration.
.gitignore        | Git configuration for ignored files.
.jshintrc         | JSHint configuration
bower.json        | Bower configuration and dependency list.
gulpfile.js       | Contains build specification for Gulp.
karma.conf.js     | Karma configuration
package.json      | NPM configuration. Mainly used to list the dependencies needed for asset compilation.
