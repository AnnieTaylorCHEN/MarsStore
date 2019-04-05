
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js',
    about: './src/about.js',
    store: './src/store.js',
    fans: './src/fans.js'
  },

  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "public")
  },

  optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin(),
      new TerserPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        },
        inject: true,
        chunks: ['index'],
        filename: 'index.html'
      }),
      new HtmlWebpackPlugin({
        template: "./src/about.html",
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        },
        inject: true,
        chunks: ['about'],
        filename: 'about.html'
      })
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ 
        filename: "styles.[contenthash].css", 
        chunkFilename: "[id].css"}),
    new CleanWebpackPlugin(), 
  ],
  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        },
        {
            test: /\.css$/,
            use: [
            MiniCssExtractPlugin.loader, 
            "css-loader"
            ]
        },
        {
          test: /\.(svg|png|jpg|gif)$/,
          use: {
              loader: "file-loader",
              options: {
              name: "[name].[hash].[ext]",
              outputPath: "imgs"}
              }
      }
    ]
    }
}