var menu = require('../index');

var timeout;

menu
    .addDelimiter('-', 40, 'Jobs')
    .addItem(
        'Start fake job',
        function(seconds) {
            console.log('Starting fake job for ' + seconds + 's (press Enter to cancel)...');
            timeout = setTimeout(function() {
                console.log('Fake job finished');
                timeout = undefined;
            }, seconds * 1000);
        },
        null,
        [{ name: 'seconds', type: 'numeric' }]
    )
    .continueCallback(function() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
            console.log('Fake job cancelled');
        }
    })
    .start();
