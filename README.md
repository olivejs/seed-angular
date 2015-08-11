# AngularJS Seed

> Olive seed for AngularJS - offers you quickly scaffold an AngularJS project with pragmatic defaults and best practices.

![tech-stack][tech-stack]

## Usage

Install gulp, bower and olive if you haven't already:
```
npm install -g olive gulp bower
```
Create your project from this Angular seed using Olive CLI:
```
mkdir myapp && cd myapp
olive new angular
```
Install npm and bower dependencies:
```
npm install && bower install
```
Start developing:
```
npm start
```
Run test once and generate code coverage reports in `coverage` directory.
```
npm test
```
Build for production:
```
npm run build
```

## Features

#### Test Driven Development

While developing your app, keep an eye on all unit-test specs.

![reporter][reporter-image]

#### Test coverage

See how much of your code is covered by well-written test scripts.

![coverage][coverage-image]

#### Supports Multiple layouts

Not all the view templates follow the same layout. Use an intuitive way to structure the layouts and partials.

![layouts][layouts-image]

## Directory Structure

```
├─src/
│ ├─app/
│ │ ├─components/
│ │ │ └─navbar/
│ │ │   ├─repoinfo.directive.js
│ │ │   ├─repoinfo.html
│ │ │   └─repoinfo.scss
│ │ ├─config/
│ │ │ ├─modules.js
│ │ │ ├─routes.js
│ │ │ └─run.js
│ │ ├─layouts/
│ │ │ └─default/
│ │ │   ├─default.html
│ │ │   └─default.scss
│ │ ├─partials/
│ │ │ ├─footer/
│ │ │ │ ├─footer.html
│ │ │ │ └─footer.scss
│ │ │ └─header/
│ │ │   ├─header.html
│ │ │   └─header.scss
│ │ ├─pods/
│ │ │ └─home/
│ │ │   ├─home.controller.js
│ │ │   ├─home.controller.spec.js
│ │ │   ├─home.html
│ │ │   └─home.scss
│ │ ├─services/
│ │ │ └─github
│ │ │   └─github.service.js
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
├─.gitattributes
├─.gitignore
├─.jscsrc
├─.jshintrc
├─.oliverc
├─bower.json
├─gulpfile.js
├─karma.conf.js
├─package.json
└─README.md
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
.oliverc          | Olive configuration.
.gitattributes    | Definition for Git attributes.
.gitignore        | Git configuration for ignored files.
.jscsrc           | JavaScript code style configuration.
.jshintrc         | JSHint configuration.
.oliverc          | Olive configuration.
bower.json        | Bower configuration and dependency list.
gulpfile.js       | Contains build specification for Gulp.
karma.conf.js     | Karma configuration.
package.json      | NPM configuration. Mainly used to list the dependencies needed for asset compilation.
README.md         | This documentation.

## .oliverc

Default options:
```
{
  "paths": {
    "src": "src",
    "tmp": ".tmp",
    "dist": "dist"
  }
}
```
These default options can be overridden. You can also include additional options from the following:

#### Ports

For example:
```
{
  "ports": {
    "app": 3000,
    "bs": 3001,
    "karma": 3002
  }
}
```
- `app`: The app will be served via this port (i.e. http://localhost:3000)
- `bs`: BrowserSync UI control panel can be accessed via this port (i.e. http://localhost:3001)
- `karma`: Karma tests report page is served via this port (i.e. http://localhost:3002/debug.html)

#### Content Security Policy

For example:
```
{
  "content-security-policy": {
    "development": {
      "default-src": "'unsafe-inline' 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'",
      "style-src": "'self' 'unsafe-inline'",
      "media-src": "*",
      ...
      "other-directive": "other-source"
    },
    "production": {
      "default-src": "'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'",
      "style-src": "'self' 'unsafe-inline'",
      "media-src": "*"
    },
    "other-env": {
      ...
    }
  }  
}
```

[tech-stack]: https://cloud.githubusercontent.com/assets/508043/9190800/b12eb888-3fc7-11e5-97a2-2b1f44a89315.png
[reporter-image]: https://cloud.githubusercontent.com/assets/508043/9190160/172fefc4-3fc0-11e5-97a0-6d52fbb495c3.png
[coverage-image]: https://cloud.githubusercontent.com/assets/508043/9190201/8013b372-3fc0-11e5-94c5-f8cdfcc78b2b.png
[layouts-image]:https://cloud.githubusercontent.com/assets/508043/9190288/77dd3222-3fc1-11e5-891e-be8e1cbf26ed.png
