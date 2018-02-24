const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = [
  // Web
  merge(common, {
    devtool: 'source-map',
    plugins: [
      new UglifyJSPlugin({
        sourceMap: true
      }),
      new WorkboxPlugin({
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: new RegExp('https://licensebuttons.net'),
            handler: 'staleWhileRevalidate'
          },
          {
            urlPattern: new RegExp('http://fonts.googleapis.com'),
            handler: 'staleWhileRevalidate'
          },
          {
            urlPattern: new RegExp('http://fonts.gstatic.com'),
            handler: 'staleWhileRevalidate'
          }
        ]
      })
    ]
  }),
  // Node (prerender)
  {
    target: 'node',
    externals: [nodeExternals({
      whitelist: [ /\.svg$/ ]
    })],
    entry: {
      prerender: './script/prerender.js'
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
      path: path.resolve(__dirname, 'script/__build__')
    },
    resolve: {
      modules: ['src', 'node_modules']
    },
    plugins: [
      // Only want the EnvironmentPlugin
      common.plugins.find(plugin => plugin instanceof webpack.EnvironmentPlugin)
    ],
    module: {
      rules: [
        // Replace the rule for CSS files
        {
          test: /\.css$/,
          loader: 'css-loader/locals',
          options: {
            modules: true
          }
        },
        ...common.module.rules.filter(rule => !rule.test.test('file.css'))
      ]
    }
  }
];
