/* eslint-disable */
var gulp = require('gulp');
var sass = require('gulp-sass');
var size = require('gulp-size');
var util = require('gulp-util');
var copy = require('gulp-copy');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var print = require('gulp-print');
var webpack = require('webpack-stream');
var generateWebpackConfig = require('./generateWebpackConfig.js');
var eslint = require('gulp-eslint');
var scsslint = require('gulp-scss-lint');
var serve = require('gulp-serve');
var rimraf = require('rimraf');
var fs = require('fs');

// pull the build environment from the '--type <foo>' arg
var environment = util.env.type || 'development';

var srcDir = './src';
var buildDir = './build';

var backgroundDir = '/background';
var browserActionDir = '/browserAction';
var contentScriptDir = '/contentScript';
var imagesDir = '/images'

var backgroundJsEntry = srcDir + backgroundDir + '/background.js';
var browserActionJsEntry = srcDir + browserActionDir + '/browserAction.js';
var contentScriptJsEntry = srcDir + contentScriptDir + '/contentScript.js';

var backgroundJsArtifact = './' + backgroundDir + '/background.js';
var browserActionJsArtifact = './' + browserActionDir + '/browserAction.js';
var contentScriptJsArtifact = './' + contentScriptDir + '/contentScript.js';

var backgroundWebpackConfig = generateWebpackConfig(backgroundJsEntry, backgroundJsArtifact);
var browserActionWebpackConfig = generateWebpackConfig(browserActionJsEntry, browserActionJsArtifact);
var contentScriptWebpackConfig = generateWebpackConfig(contentScriptJsEntry, contentScriptJsArtifact);

function fsExistsSync(filePath) {
  try {
    var stats = fs.statSync(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

function mkdirsIfMissing() {
  for (var i = 0; i < arguments.length; i++) {
    if (!fsExistsSync(arguments[i])) fs.mkdirSync(arguments[i]);
  }
}
function rmIfExists() {
  for (var i = 0; i < arguments.length; i++) {
    if (fsExistsSync(arguments[i])) rimraf.sync(arguments[i]);
  }
}

function doWebpack(config) {
  return gulp.src(config.entry)
    .pipe(webpack(config))
    .pipe(environment === 'production' ? uglify() : util.noop())
    .pipe(gulp.dest(buildDir))
    .pipe(size({title: 'js'}))
    ;
}

var taskFuncs = {
  'setup-build': function() {
    mkdirsIfMissing(
      buildDir,
      buildDir + backgroundDir,
      buildDir + browserActionDir,
      buildDir + contentScriptDir,
      buildDir + imagesDir
    );
  },
  'clean': function() {
    rmIfExists(buildDir);
  },
  'build-background-js': function() {
    return doWebpack(backgroundWebpackConfig.getConfig(environment));
  },
  'build-browseraction-html': function() {
    console.log(srcDir + browserActionDir + '/browserAction.html')
    return gulp.src(srcDir + browserActionDir + '/browserAction.html')
      .pipe(gulp.dest(buildDir + browserActionDir));
  },
  'build-browseraction-js': function() {
    return doWebpack(browserActionWebpackConfig.getConfig(environment));
  },
  'build-browseraction-css': function() {
    return gulp.src(srcDir + browserActionDir + '/browserAction.scss')
      .pipe(sass({
         includePaths: [
           './node_modules/bootstrap-sass/assets/stylesheets'
         ]
      }).on('error', sass.logError))
      .pipe(rename('browserAction.css'))
      .pipe(gulp.dest(buildDir + browserActionDir))
      .pipe(size({title: 'css'}))
      ;
  },
  'build-contentscript-js': function() {
    return doWebpack(contentScriptWebpackConfig.getConfig(environment));
  },
  'build-images': function() {
    return gulp.src([srcDir + imagesDir + '/*.png'])
      .pipe(rename({dirname: ''}))
      .pipe(gulp.dest(buildDir + imagesDir));
  },
  'build-manifest': function() {
    return gulp.src(srcDir + '/manifest.json')
      .pipe(gulp.dest(buildDir));
  },
  'watch-background-js': function() {
    var config = backgroundWebpackConfig.getConfig(environment);
    config.watch = true;
    return doWebpack(config);
  },
  'watch-browseraction-js': function() {
    var config = browserActionWebpackConfig.getConfig(environment);
    config.watch = true;
    return doWebpack(config);
  },
  'watch-browseraction-scss': function() {
    return gulp.watch(
      [srcDir + browserActionDir + '/browserAction.scss'],
      ['build-browseraction-css']
    );
  },
  'watch-contentscript-js': function() {
    var config = contentScriptWebpackConfig.getConfig(environment);
    config.watch = true;
    return doWebpack(config);
  },
  'lint-js': function() {
    return gulp.src('src/**/*.js')
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      ;
  },
  'lint-scss': function() {
    return gulp.src('src/**/*.scss')
      .pipe(scsslint())
      .pipe(scsslint.failReporter())
    ;
  }
};

gulp.task('setup-build', taskFuncs['setup-build']);
gulp.task('clean', taskFuncs['clean']);

gulp.task('build-background-js', ['setup-build'], taskFuncs['build-background-js']);

gulp.task('build-browseraction-js', ['setup-build'], taskFuncs['build-browseraction-js']);
gulp.task('build-browseraction-html', ['setup-build'], taskFuncs['build-browseraction-html']);
gulp.task('build-browseraction-css', ['setup-build'], taskFuncs['build-browseraction-css']);
gulp.task('build-browseraction', ['setup-build', 'build-browseraction-js',
          'build-browseraction-html', 'build-browseraction-css']);

gulp.task('build-contentscript-js', ['setup-build'], taskFuncs['build-contentscript-js']);

gulp.task('build-images', ['setup-build'], taskFuncs['build-images']);

gulp.task('build-manifest', ['setup-build'], taskFuncs['build-manifest']);

gulp.task('build', ['setup-build', 'build-background-js', 'build-browseraction',
                    'build-contentscript-js', 'build-images', 'build-manifest']);

gulp.task('watch-background-js', ['setup-build'], taskFuncs['watch-background-js']);
gulp.task('watch-browseraction-js', ['setup-build'], taskFuncs['watch-browseraction-js']);
gulp.task('watch-browseraction-scss', ['setup-build'], taskFuncs['watch-browseraction-scss']);
gulp.task('watch-contentscript-js', ['setup-build'], taskFuncs['watch-contentscript-js']);
gulp.task('watch', ['watch-background-js', 'watch-browseraction-js',
  'watch-browseraction-scss', 'watch-contentscript-js']);

gulp.task('lint-js', taskFuncs['lint-js']);
gulp.task('lint-scss', taskFuncs['lint-scss']);
gulp.task('lint', ['lint-js', 'lint-scss']);