var Mock = require('mockjs');

var data = Mock.mock({
    "array|1-3": [
        "Hello",
        "Mock.js",
        "!"
    ]
})

module.exports = data;