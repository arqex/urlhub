var Path = require('path');

module.exports = {
  entry: "./urlhub.js",
  output: {
    path: Path.join( __dirname, 'build' ),
    filename: 'urlhub.js',
    libraryTarget: 'umd'
  }
}
