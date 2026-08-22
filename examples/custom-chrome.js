var menu = require('../index');

menu
    .customHeader(function() {
        process.stdout.write('\n=== Ops Console ===\n');
        process.stdout.write('node-menu custom header demo\n\n');
    })
    .customPrompt(function() {
        process.stdout.write('Select an action > ');
    })
    .addDelimiter('-', 40, 'Actions')
    .addItem('Ping', function() {
        console.log('pong');
    })
    .addItem('Show time', function() {
        console.log(new Date().toISOString());
    })
    .start();
