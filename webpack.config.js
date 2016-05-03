module.exports = {
  entry: __dirname + '/client/js/app.js',
  output: {
    path: __dirname + '/client/',
    filename: 'bundle.js'
  },
  loaders: [
    { test: /\.css$/, loaders: ["style", "css"] },
    { test: /\.less$/, loaders: ["style", "css", "less"] }
  ]
}
