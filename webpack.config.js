const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: {
        'babel-polyfill': 'babel-polyfill',
        entry: './src/index.js',
    },
    node: {
        fs: 'empty'
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./public/images", to: "./images" },
                { from: "./public/downloadFilesImages", to: "./downloadFilesImages" }
            ]
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'WellManager Web React',
            favicon: "./public/favicon.ico"
        }),
        new Dotenv({ defaults: true }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          react_vendors: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react_vendors',
            chunks: 'all'
          },
          telerik_tool: {
            test: /[\\/]node_modules[\\/](@progress)[\\/]kendo-react-data-tools[\\/]/,
            name: 'telerik_tool',
            chunks: 'all',
            reuseExistingChunk: true
          },
          telerik_grid: {
            test: /[\\/]node_modules[\\/](@progress)[\\/]kendo-react-grid[\\/]/,
            name: 'telerik_grid',
            chunks: 'all',
            reuseExistingChunk: true
          },
          telerik_inputs: {
            test: /[\\/]node_modules[\\/](@progress)[\\/]kendo-react-inputs[\\/]/,
            name: 'telerik_inputs',
            chunks: 'all',
            reuseExistingChunk: true
          },
          telerik_dateinputs: {
            test: /[\\/]node_modules[\\/](@progress)[\\/]kendo-react-dateinputs[\\/]/,
            name: 'telerik_dateinputs',
            chunks: 'all',
            reuseExistingChunk: true
          },
          telerik_theme: {
            test: /[\\/]node_modules[\\/](@progress)[\\/]kendo-react-theme-default[\\/]/,
            name: 'telerik_theme',
            chunks: 'all',
            reuseExistingChunk: true
          },
          telerik_dropdowns: {
            test: /[\\/]node_modules[\\/](@progress)[\\/]kendo-react-dropdowns[\\/]/,
            name: 'telerik_dropdowns',
            chunks: 'all',
            reuseExistingChunk: true
          },
          telerik_buttons: {
            test: /[\\/]node_modules[\\/](@progress)[\\/]kendo-react-buttons[\\/]/,
            name: 'telerik_buttons',
            chunks: 'all',
            reuseExistingChunk: true
          },
          flexlayout: {
            test: /[\\/]node_modules[\\/]flexlayout-react[\\/]/,
            name: 'flexlayout',
            chunks: 'all',
            reuseExistingChunk: true
          },
          babel: {
            test: /[\\/]node_modules[\\/]@babel[\\/]/,
            name: 'babel',
            chunks: 'all',
            reuseExistingChunk: true
          },
        }
      }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: '[name].chunk.js',
        filename: '[name].bundle.js'
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
                test: /\.m?(js|jsx)$/,
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