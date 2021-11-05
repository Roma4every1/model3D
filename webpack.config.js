const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: ['babel-polyfill', './src/index.js'],
    plugins: [
      new HtmlWebpackPlugin({
          title: 'Output Management',
      }),
      new Dotenv(),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.bundle.js'
    },
    module: {
        rules: [
          {
              test: /\.css$/i,
              use: ["style-loader", "css-loader", "postcss-loader"],
          },
          {
              test: /\.(png|jpe?g|gif)$/i,
              use: [
                {
                    loader: 'file-loader',
                },
              ],
          },
        {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        "@babel/plugin-transform-react-jsx",
                        "@babel/plugin-proposal-class-properties"
                    ]
                }
            }
        },
        ],
    },
};