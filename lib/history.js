var fs = require('fs');
var path = require('path');
var os = require('os');

function History(options) {
    options = options || {};
    this.sessionMaxEntries = options.sessionMaxEntries != null ? options.sessionMaxEntries : 100;
    this.persist = !!options.persist;
    this.maxEntries = options.maxEntries != null ? options.maxEntries : 100;
    this.path = options.path || path.join(os.homedir(), '.node-menu_history');
    this._session = [];
    this._persisted = [];
}

function pushUnique(list, line, max) {
    var idx = list.indexOf(line);
    if (idx !== -1) {
        list.splice(idx, 1);
    }
    list.push(line);
    while (list.length > max) {
        list.shift();
    }
}

History.prototype.getSession = function() {
    return this._session.slice();
};

History.prototype.getPersisted = function() {
    return this._persisted.slice();
};

History.prototype.getSessionForReadline = function() {
    return this._session.slice().reverse();
};

History.prototype.recordSession = function(line) {
    if (!line) {
        return;
    }
    pushUnique(this._session, line, this.sessionMaxEntries);
};

History.prototype.recordPersisted = function(line) {
    if (!this.persist || !line) {
        return;
    }
    pushUnique(this._persisted, line, this.maxEntries);
    this.save();
};

History.prototype.removePersisted = function(line) {
    if (!this.persist || !line) {
        return;
    }
    var idx = this._persisted.indexOf(line);
    if (idx !== -1) {
        this._persisted.splice(idx, 1);
        this.save();
    }
};

History.prototype.replacePersisted = function(lines) {
    if (!this.persist) {
        return;
    }
    this._persisted = (lines || []).slice();
    this.save();
};

History.prototype.clearSession = function() {
    this._session = [];
};

History.prototype.seedSessionFromPersisted = function() {
    this._session = this._persisted.slice();
};

History.prototype.load = function() {
    var self = this;
    if (!self.persist) {
        return;
    }
    try {
        if (!fs.existsSync(self.path)) {
            self._persisted = [];
            return;
        }
        var text = fs.readFileSync(self.path, 'utf8');
        self._persisted = text.split(/\r?\n/).map(function(l) {
            return l.trim();
        }).filter(Boolean);
        while (self._persisted.length > self.maxEntries) {
            self._persisted.shift();
        }
    } catch (err) {
        console.error('node-menu: failed to load history: ' + err.message);
        self._persisted = [];
    }
};

History.prototype.save = function() {
    var self = this;
    if (!self.persist) {
        return;
    }
    try {
        var body = self._persisted.length ? self._persisted.join('\n') + '\n' : '';
        fs.writeFileSync(self.path, body, 'utf8');
    } catch (err) {
        console.error('node-menu: failed to save history: ' + err.message);
    }
};

module.exports = History;
