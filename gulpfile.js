var gulp = require('gulp'),
  webpackStream = require('webpack-stream'),
  webpack = require('webpack'),
  rename = require('gulp-rename'),
  run = require('tape-run')
;

console.log( webpack );

function build( filename, min ){
  var config = {output: {libraryTarget: 'umd'}};
  var stream = gulp.src( filename + '.js' );

  if( min ){
    filename += '.min';
    config.plugins = [ new webpack.optimize.UglifyJsPlugin() ]
  }

  return stream.pipe( webpackStream( config ) )
    .pipe( rename(filename + '.js') )
    .pipe( gulp.dest('dist/') )
  ;
}

gulp.task( 'test', function(){
  gulp.src( 'tests/test-routes.js' )
    .pipe( webpackStream() )
    .pipe( run() )
    .pipe( process.stdout )
  ;
});

gulp.task( 'default', ['test'], function(){
  build('urlhub');
  return build('urlhub', true);
});
