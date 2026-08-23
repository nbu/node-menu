var path = require('path');
var os = require('os');
var menu = require('../index');

var historyFile = path.join(os.tmpdir(), 'node-menu-example-history');

menu
    .configureHistory({
        persist: true,
        path: historyFile,
        sessionMaxEntries: 50,
        maxEntries: 50
    })
    .customHeader(function() {
        console.log('History persist demo');
        console.log('History file: ' + historyFile);
    })
    .addItem('Say hi', function() {
        console.log('hi');
    })
    .addItem('Echo', function(msg) {
        console.log(msg);
    }, null, [{ name: 'msg', type: 'string' }])
    .start();
