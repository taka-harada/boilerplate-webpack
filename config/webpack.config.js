const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const fs = require('fs');

const getAllTemplateFiles = (dirName, ext) => {
  return new Promise((resolve, reject) => {
    let arr = [];
    fs.readdir('./' + dirName, (err, files) => {
      if (err) console.log(err.stack);
      files.forEach((file) => {
        if (file.indexOf(ext) === -1) return;
        const tmp = {
          filename: 'html/' + file.replace(ext, '.html'),
          template: './' + dirName + '/' + file,
          alwaysWriteToDisk: true
        };
        arr.push(new HtmlWebpackPlugin(tmp));
      });
      arr.push(new HtmlWebpackHarddiskPlugin());
      resolve(arr);
    });
  });
};

const createConfig = async () => {
  const arr = await getAllTemplateFiles('src/pug', '.pug');
  const obj = {
    entry: {
      main: './src/js/entries/main.js',
      top: './src/js/entries/top.js',
      archive: './src/js/entries/archive.js'
    },
    output: {
      path: path.join(__dirname, '../wordpress/src/content/themes/child-theme'),
      filename: 'assets/js/[name].bundle.js'
    },
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.(css|scss)$/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: (loader) => [
                require('autoprefixer')({
                  browsers: ['last 2 version', '> 1%', 'iOS 8', 'iOS 9', 'android 4.1', 'android 4.2', 'android 4.3']
                })
              ],
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }],
          publicPath: '../../'
        })
      }, {
        test: /\.(jpe?g|png|gif|svg|ico)(\?.+)?$/,
        include: [
          path.resolve(__dirname, '../src/img')
        ],
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            outputPath: url => url.replace(/src\//, 'assets/')
          }
        }
      }, {
        test: /\.(eot|otf|ttf|woff2?|svg)(\?.+)?$/,
        include: [
          path.resolve(__dirname, '../src', 'font')
        ],
        use: {
          loader: 'url-loader',
          options: {
            name: 'assets/font/[name].[ext]'
          }
        }
      }, {
        test: /\.pug$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: false
          }
        }, {
          loader: 'pug-html-loader',
          options: {
            pretty: true,
            exports: false
          }
        }]
      }, {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, '../src')
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  'modules': false
                }]
              ]
            }
          },
          {
            loader: 'eslint-loader'
          }
        ],
        exclude: /node_modules/
      }]
    },
    plugins: [
      // new StyleLintPlugin(),
      new ExtractTextPlugin('assets/css/bundle.css'),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true
      }),
      new CopyWebpackPlugin([{
        from: path.resolve(__dirname, '../src', 'img'),
        to: 'html/assets/img'
      }]),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['top', 'archive'],
      }),
    ].concat(arr),
    resolve: {
      extensions: ['.js']
    },
    devServer: {
      contentBase: path.join(__dirname, '../wordpress/src/content/themes/child-theme/html'),
      port: 8081,
      watchContentBase: true,
      open: true
    }
  };
  return obj;
};
module.exports = createConfig;
