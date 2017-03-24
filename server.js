const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config.js');
for (let p in config.entry) {
    config.entry[p] = ['webpack-dev-server/client?http://localhost:3000/', 'webpack/hot/dev-server', config.entry[p]];
}

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    // contentBase: './src',
    hot: true,
    setup: app => {
        require('./router')(app, 1);
    }
});
server.listen(3000);