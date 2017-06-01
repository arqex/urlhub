var Path = require('path');

module.exports = {
  entry: "./urlhub.js",
  output: {
    path: Path.join( __dirname, 'build' ),
    filename: 'urlhub.js',
    library: 'urlhub',
    libraryTarget: 'umd'
  },
  module:{
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          presets: ['env']
        }
      }
    ]
  }
}
