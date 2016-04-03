var gulp = require('gulp');
var util = require('gulp-util');
var sass = require('gulp-sass');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var eslint = require('gulp-eslint');
var webpack = require('webpack-stream');
var scsslint = require('gulp-scss-lint');
var rimraf = require('rimraf');

var fs = require('fs');
var generateWebpackConfig = require('./generateWebpackConfig.js');

var environment = util.env.type || 'development';

var srcDir = './src';
var buildDir = './build';

var clientDir = '/js';
var vidDir = '/vid';
var cssDir = '/css';

var clientJsEntry = srcDir + clientDir + '/client.js';

var jsArtifact = './js' + '/client.js';

var clientWebpackConfig = generateWebpackConfig(clientJsEntry, jsArtifact);

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
      buildDir + clientDir,
      buildDir + vidDir,
      buildDir + cssDir
    );
  },
  'clean': function() {
    rmIfExists(buildDir);
  },
  'build-client-html': function() {
    return gulp.src(srcDir + '/client.html')
        .pipe(gulp.dest(buildDir));
  },
  'build-client-js': function() {
    return doWebpack(clientWebpackConfig.getConfig(environment));
  },
  'build-client-css': function() {
    return gulp.src(srcDir + cssDir + '/client.scss')
      .pipe(sass({
        includePaths: [
            './node_modules/bootstrap-sass/assets/stylesheets'
        ]
      }).on('error', sass.logError))
        .pipe(rename('client.css'))
        .pipe(gulp.dest(buildDir + cssDir))
        .pipe(size({title: 'css'}))
        ;
  },
  'build-vids': function() {
    return gulp.src(srcDir + vidDir + '/samplevideo.mp4')
      .pipe(rename({dirname: ''}))
      .pipe(gulp.dest(buildDir + vidDir))
      ;
  },
  'watch-client-js': function() {
    var config = clientWebpackConfig.getConfig(environment);
    config.watch = true;
    return doWebpack(config);
  },
  'watch-client-scss': function() {
    return gulp.watch(
      srcDir + cssDir + '/client.scss',
      'build-client-css'
    );
  },
  'lint-js': function() {
    return gulp.src('src/js/*.js')
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


gulp.task('build-client-js', ['setup-build'], taskFuncs['build-client-js']);
gulp.task('build-client-html', ['setup-build'], taskFuncs['build-client-html']);
gulp.task('build-client-scss', ['setup-build'], taskFuncs['build-client-css']);

gulp.task('build-vids', ['setup-build'], taskFuncs['build-vids']);

gulp.task('build', ['setup-build', 'build-client-js', 'build-client-html',
                    'build-client-scss', 'build-vids']);

gulp.task('watch-client-js', ['setup-build'], taskFuncs['watch-client-js']);
gulp.task('watch-client-scss', ['setup-build'], taskFuncs['watch-client-scss']);
gulp.task('watch', ['watch-client-js', 'watch-client-scss']);

gulp.task('lint-js', taskFuncs['lint-js']);
gulp.task('lint-scss', taskFuncs['lint-scss']);
gulp.task('lint', ['lint-js', 'lint-scss']);