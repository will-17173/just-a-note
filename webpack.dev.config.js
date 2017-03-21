const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const entries = glob.sync(path.join(__dirname, '/src/**/*.entry.js'));
var entry = {};

entries.forEach((val, i) => {
    let name = path.basename(val, '.entry.js');
    entry[name] = entries[i];
});


module.exports = {
    context: __dirname + '/src',
    devtool: 'source-map',
    entry: entry,
    output: {
        filename: '[name].js',
        publicPath: './dist',
        path: path.resolve(__dirname, './dist')
    },
    externals: {
        'jquery': 'jQuery'
    },
    // devServer: {
    //     contentBase: __dirname + '/src',
    //     port: 3000
    // },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
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