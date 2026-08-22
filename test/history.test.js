var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var History = require('../lib/history');

var tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'node-menu-history-'));
var historyPath = path.join(tmpDir, 'history');

function make(opts) {
    opts = opts || {};
    return new History({
        sessionMaxEntries: opts.sessionMaxEntries != null ? opts.sessionMaxEntries : 100,
        persist: !!opts.persist,
        path: opts.path || historyPath,
        maxEntries: opts.maxEntries != null ? opts.maxEntries : 100
    });
}

// session: records non-empty
var h = make({ sessionMaxEntries: 3 });
h.recordSession('');
h.recordSession(null);
assert.deepStrictEqual(h.getSession(), []);
h.recordSession('1');
h.recordSession('2');
assert.deepStrictEqual(h.getSession(), ['1', '2']);

// session: unique move-to-end
h.recordSession('1');
assert.deepStrictEqual(h.getSession(), ['2', '1']);

// session: truncate from front
h.recordSession('3');
h.recordSession('4');
assert.deepStrictEqual(h.getSession(), ['1', '3', '4']);

// readline order newest-first
assert.deepStrictEqual(h.getSessionForReadline(), ['4', '3', '1']);

// persist off: no file, recordPersisted no-op
h = make({ persist: false });
h.recordSession('1 a');
h.recordPersisted('1 a');
assert.deepStrictEqual(h.getPersisted(), []);
assert.strictEqual(fs.existsSync(historyPath), false);

// persist on: save successful only via recordPersisted
h = make({ persist: true, maxEntries: 3 });
h.recordSession('bad');
h.recordPersisted('1 ok');
h.recordPersisted('2 ok');
assert.deepStrictEqual(h.getPersisted(), ['1 ok', '2 ok']);
assert.strictEqual(fs.readFileSync(historyPath, 'utf8'), '1 ok\n2 ok\n');

// persist: unique move-to-end + truncate
h.recordPersisted('1 ok');
h.recordPersisted('3 ok');
h.recordPersisted('4 ok');
assert.deepStrictEqual(h.getPersisted(), ['1 ok', '3 ok', '4 ok']);

// load seeds; missing file empty
h = make({ persist: true });
h.load();
assert.deepStrictEqual(h.getPersisted(), ['1 ok', '3 ok', '4 ok']);
h.seedSessionFromPersisted();
assert.deepStrictEqual(h.getSession(), ['1 ok', '3 ok', '4 ok']);

var missing = make({ persist: true, path: path.join(tmpDir, 'nope') });
missing.load();
assert.deepStrictEqual(missing.getPersisted(), []);

// removePersisted rollback
h = make({ persist: true });
h.load();
h.recordPersisted('boom');
h.removePersisted('boom');
assert.strictEqual(h.getPersisted().indexOf('boom'), -1);

// clearSession
h.clearSession();
assert.deepStrictEqual(h.getSession(), []);

console.log('ok');
