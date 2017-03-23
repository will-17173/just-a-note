const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const entries = glob.sync(path.join(__dirname, '/src/**/*.entry.js'));
const moment = require('moment');
var entry = {};

entries.forEach(function(val, i) {
    let name = path.basename(val, '.entry.js');
    entry[name] = entries[i];
});

module.exports = {
    entry: entry,
    output: {
        filename: '[name].js',
        path: './dist/js'
    },
    externals: {
        'jquery': 'jQuery'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            },
            output: {
                comments: false,
                ascii_only: true
            }
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js'
        }),
        new webpack.BannerPlugin({
            banner: "Date: " + moment().format('YYYY-MM-DD hh:mm:ss') + ", Author: Will.H",
            entryOnly: true
        })
    ],
    module: {
        rules: [{
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.handlebars$/,
                loader: 'handlebars-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }

};