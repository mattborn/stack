
var concat = require('gulp-concat');
var connect = require('connect');
var gulp = require('gulp');
var sass = require('gulp-sass');
var serve_static = require('serve-static');
var tiny_lr = require('tiny-lr');
var util = require('gulp-util');
var webpack = require('gulp-webpack');

gulp.task('webpack', function () {
  return gulp.src('src/app.js')
    .pipe(webpack(require('./webpack-config')))
    .pipe(gulp.dest('build'));
});

gulp.task('sass', function () {
  return gulp.src('src/styles/index.scss')
    .pipe(sass({
      includePaths: ['src/styles'].concat(require('node-bourbon').includePaths)
    }).on('error', util.log))
    // .pipe(if gulp.env.production then minifyCSS() else gutil.noop())
    .pipe(gulp.dest('build/assets'));
});

gulp.task('copy', function () {
  return gulp.src([
      'src/**/*',
      '!src/**/*.js',
      '!src/**/*.jsx',
      '!src/**/*.scss'
    ])
    .pipe(gulp.dest('build'));
});

gulp.task('vendor', function () {
  return gulp.src([
      'node_modules/firebase/lib/firebase-web.js'
    ])
    .pipe(gulp.dest('build/vendor'));
});

gulp.task('build', ['webpack', 'sass', 'copy', 'vendor']);

gulp.task('dev', ['build'], function () {
  var servers = createServers();
  gulp.watch(['src/index.html'], ['build']);
  gulp.watch([
    'src/**/*.js'
  ], ['webpack']);
  gulp.watch(['src/styles/*'], ['sass']);
  gulp.watch(['build/**/*'], function (e) {
    util.log(util.colors.cyan(e.path), 'changed');
    servers.lr.changed({
      body: {
        files: [e.path]
      }
    });
  });
});

gulp.task('default', ['build']);

function createServers () {
  var lr = tiny_lr();
  var lr_port = 35729;
  lr.listen(lr_port, function () {
    util.log('LiveReload listening on', lr_port);
  });
  var app = connect().use(serve_static('build'));
  var app_port = 1984;
  require('http').createServer(app).listen(app_port, function () {
    util.log('HTTP server listening on', app_port);
  });
  return {
    lr: lr,
    app: app
  };
};
