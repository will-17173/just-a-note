var urlmap = {
    index: 'index',
    list: 'list'
}
for (var p in urlmap) {
    urlmap[p] = urlmap[p] + '.mock.json';
}

module.exports = urlmap;