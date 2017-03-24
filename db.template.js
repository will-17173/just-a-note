const mongoose = require('mongoose');

var db = mongoose.createConnection('database address', 'database name');
db.on('error', console.error.bind(console, 'err:'));
db.once('open', function() {
    console.log('DB connected.')
});

module.exports = db;