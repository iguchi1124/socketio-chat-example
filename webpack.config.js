module.exports = {
  entry: __dirname + '/client/js/app.js',
  output: {
    path: __dirname + '/client/js/',
    filename: 'bundle.js'
  },
  loaders: [
    {
      test: /\.css$/,
      loader: "style!css"
    }
  ]
}
