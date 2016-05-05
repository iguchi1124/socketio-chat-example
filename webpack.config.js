var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: __dirname + '/client/js/app.js',
  output: {
    path: __dirname + '/public/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.html$/,  loader: "html" },
      { test: /\.jade$/,  loader: "jade" },
      { test: /\.css$/, loaders: ["style", "css"] },
      { test: /\.less$/, loaders: ["style", "css", "less"] }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/client/jade/app.jade'
    })
  ]
}
