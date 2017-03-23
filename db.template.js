const mongoose = require('mongoose');

var db = mongoose.createConnection('database address', 'database name'); //创建一个数据库连接
db.on('error', console.error.bind(console, 'err:'));
db.once('open', function() {
    console.log('DB connected.')
});

module.exports = db;