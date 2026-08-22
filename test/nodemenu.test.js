var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var readline = require('readline');

function freshMenu() {
    delete require.cache[require.resolve('../lib/nodemenu')];
    return require('../lib/nodemenu');
}

function withStubbedMenu(run) {
    var originalCreateInterface = readline.createInterface;
    var originalLog = console.log;
    var originalWrite = process.stdout.write;
    var questions = [];
    var writes = '';
    var rl = {
        history: [],
        question: function(prompt, callback) {
            questions.push(callback);
        },
        close: function() {}
    };

    readline.createInterface = function() {
        return rl;
    };
    console.log = function() {};
    process.stdout.write = function(text) {
        writes += text;
        return true;
    };

    try {
        run(freshMenu(), rl, questions, function() {
            return writes;
        });
    } finally {
        readline.createInterface = originalCreateInterface;
        console.log = originalLog;
        process.stdout.write = originalWrite;
    }
}

// resetMenu must not remove stdin listeners owned by readline or callers.
var originalRemoveAllListeners = process.stdin.removeAllListeners;
var removeDataCalls = 0;
process.stdin.removeAllListeners = function(event) {
    if (event === 'data') {
        removeDataCalls++;
    }
    return this;
};
try {
    freshMenu().resetMenu();
} finally {
    process.stdin.removeAllListeners = originalRemoveAllListeners;
}
assert.strictEqual(removeDataCalls, 0);

// Empty input must discard readline's automatically inserted entry.
withStubbedMenu(function(menu, rl, questions) {
    menu.disableDefaultHeader().disableDefaultPrompt();
    menu.start();
    rl.history = [''];
    questions[0]('');
    assert.deepStrictEqual(rl.history, []);
});

// Continue input must sync history and tolerate a callback that resets the menu.
withStubbedMenu(function(menu, rl, questions) {
    menu.disableDefaultHeader().disableDefaultPrompt();
    menu.consoleOutput = function() {};
    menu.addItem('Run', function() {});
    menu.continueCallback(function() {
        menu.resetMenu();
    });
    menu.start();
    questions[0]('1');
    rl.history = ['', '1'];
    assert.doesNotThrow(function() {
        questions[1]('');
    });
    assert.deepStrictEqual(rl.history, ['1']);
    assert.strictEqual(questions.length, 2);
});

// The readline prompt starts on a fresh line after a custom prompt.
withStubbedMenu(function(menu, rl, questions, getWrites) {
    menu.disableDefaultHeader().customPrompt(function() {
        process.stdout.write('CUSTOM');
    });
    menu.start();
    assert.strictEqual(getWrites(), 'CUSTOM\n');
});

// A failed repeated command restores the exact persisted ordering.
withStubbedMenu(function(menu, rl, questions) {
    var tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'node-menu-rollback-'));
    var historyPath = path.join(tmpDir, 'history');
    fs.writeFileSync(historyPath, '1\n2\n', 'utf8');

    menu.disableDefaultHeader().disableDefaultPrompt();
    menu.consoleOutput = function() {};
    menu.configureHistory({ persist: true, path: historyPath });
    menu.addItem('Fail', function() {
        throw new Error('boom');
    });
    menu.start();
    questions[0]('1');

    assert.strictEqual(fs.readFileSync(historyPath, 'utf8'), '1\n2\n');
});

console.log('ok');
