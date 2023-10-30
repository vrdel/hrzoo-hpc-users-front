var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  context: __dirname,
  entry: "./src/main.jsx",
  output: {
    path: path.resolve("./bundles/reactbundle/"),
    filename: "[name]-[fullhash].js",
    chunkFilename: "[name]-[fullhash].js"
  },
  optimization: {
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
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
      "Pages": path.resolve(__dirname, "./src/pages"),
      "Components": path.resolve(__dirname, "./src/components"),
      "Utils": path.resolve(__dirname, "./src/utils"),
    }
  }
};
