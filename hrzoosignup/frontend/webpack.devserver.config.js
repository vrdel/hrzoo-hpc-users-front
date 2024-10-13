var BundleTracker = require('webpack-bundle-tracker');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: "./src/main.jsx",
  mode: "development",
  output: {
    publicPath: 'http://127.0.0.1:3001/',
  },
  devServer: {
    open: false,
    port: 3001,
    hot: false,
    liveReload: false,
    historyApiFallback: true,
    allowedHosts: 'all',
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  plugins: [
    new BundleTracker({filename: './webpack-stats.json'}),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader','css-loader', 'postcss-loader']
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          {
            loader: "sass-loader",
            options: {
              // Prefer `dart-sass`
              api: "modern",
              implementation: require('sass'),
            },
          }
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff(2)?|ttf|eot|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      Api: path.resolve(__dirname, "./src/api"),
      Assets: path.resolve(__dirname, "./src/assets"),
      Config: path.resolve(__dirname, "./src/config"),
      Components: path.resolve(__dirname, "./src/components"),
      Pages: path.resolve(__dirname, "./src/pages"),
      Styles: path.resolve(__dirname, "./src/styles"),
      Utils: path.resolve(__dirname, "./src/utils"),
    }
  }
};
