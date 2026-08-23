var path = require('path');
var os = require('os');
var menu = require('../index');

var historyFile = path.join(os.tmpdir(), 'node-menu-ai-gateway-history');
var REINDEX_MS = 2000;
var REINDEX_TOKEN_COST = 500;
var REINDEX_DOC_BUMP = 3;

function GatewayOps() {
    this._nextRequestId = 1;
    this._requests = [];
    this._indexes = [
        { name: 'docs', docCount: 120, status: 'ready' },
        { name: 'support', docCount: 45, status: 'ready' },
        { name: 'code', docCount: 80, status: 'ready' }
    ];
    this.maxRpm = 60;
    this.dailyTokenBudget = 100000;
    this.tokensUsedToday = 12500;
    this._reindexTimer = undefined;
    this._reindexingName = undefined;

    this._seedRequest('gpt-mini', 'running', 0);
    this._seedRequest('gpt-pro', 'done', 840);
    this._seedRequest('local-7b', 'done', 210);
}

GatewayOps.prototype._seedRequest = function(model, status, tokens) {
    this._requests.push({
        id: this._nextRequestId++,
        model: model,
        status: status,
        tokens: tokens
    });
};

GatewayOps.prototype._findRequest = function(id) {
    for (var i = 0; i < this._requests.length; i++) {
        if (this._requests[i].id === id) {
            return this._requests[i];
        }
    }
    return null;
};

GatewayOps.prototype._findIndex = function(name) {
    for (var i = 0; i < this._indexes.length; i++) {
        if (this._indexes[i].name === name) {
            return this._indexes[i];
        }
    }
    return null;
};

GatewayOps.prototype.openRequestCount = function() {
    var n = 0;
    this._requests.forEach(function(req) {
        if (req.status === 'running') {
            n++;
        }
    });
    return n;
};

GatewayOps.prototype.listRequests = function() {
    if (this._requests.length === 0) {
        console.log('No requests.');
        return;
    }
    this._requests.forEach(function(req) {
        console.log(
            '#' + req.id +
            '  model=' + req.model +
            '  status=' + req.status +
            '  tokens=' + req.tokens
        );
    });
};

GatewayOps.prototype.getRequest = function(id) {
    var req = this._findRequest(id);
    if (!req) {
        console.log('Request not found: ' + id);
        return;
    }
    console.log(JSON.stringify(req, null, 2));
};

GatewayOps.prototype.killRequest = function(id) {
    var req = this._findRequest(id);
    if (!req) {
        console.log('Request not found: ' + id);
        return;
    }
    if (req.status !== 'running') {
        console.log('Cannot kill request #' + id + ' (status=' + req.status + ')');
        return;
    }
    req.status = 'killed';
    console.log('Killed request #' + id);
};

GatewayOps.prototype.listIndexes = function() {
    this._indexes.forEach(function(idx) {
        console.log(
            idx.name +
            '  docs=' + idx.docCount +
            '  status=' + idx.status
        );
    });
};

GatewayOps.prototype.reindex = function(name) {
    var self = this;
    if (self._reindexTimer) {
        console.log('Reindex already in progress for "' + self._reindexingName + '"');
        return;
    }
    var idx = self._findIndex(name);
    if (!idx) {
        console.log('Index not found: ' + name);
        return;
    }
    idx.status = 'reindexing';
    self._reindexingName = name;
    console.log('Reindexing "' + name + '" (press Enter to cancel)...');
    self._reindexTimer = setTimeout(function() {
        idx.docCount += REINDEX_DOC_BUMP;
        idx.status = 'ready';
        self.tokensUsedToday += REINDEX_TOKEN_COST;
        self._reindexTimer = undefined;
        self._reindexingName = undefined;
        console.log(
            'Reindex complete for "' + name +
            '" (docs=' + idx.docCount +
            ', +' + REINDEX_TOKEN_COST + ' tokens)'
        );
    }, REINDEX_MS);
};

GatewayOps.prototype.cancelInFlight = function() {
    if (!this._reindexTimer) {
        return;
    }
    clearTimeout(this._reindexTimer);
    this._reindexTimer = undefined;
    var idx = this._findIndex(this._reindexingName);
    if (idx) {
        idx.status = 'ready';
    }
    console.log('Cancelled reindex for "' + this._reindexingName + '"');
    this._reindexingName = undefined;
};

GatewayOps.prototype.flushCache = function() {
    console.log('RAG cache flushed');
};

GatewayOps.prototype.queryIndex = function(name, query) {
    var idx = this._findIndex(name);
    if (!idx) {
        console.log('Index not found: ' + name);
        return;
    }
    if (idx.status !== 'ready') {
        console.log('Index "' + name + '" is busy (status=' + idx.status + ')');
        return;
    }
    console.log('Query "' + query + '" on index "' + name + '":');
    console.log('  1. [0.92] Matching chunk about: ' + query);
    console.log('  2. [0.81] Related note in ' + name);
};

GatewayOps.prototype.showCaps = function() {
    console.log('maxRpm=' + this.maxRpm);
    console.log('dailyTokenBudget=' + this.dailyTokenBudget);
    console.log('tokensUsedToday=' + this.tokensUsedToday);
};

GatewayOps.prototype.setMaxRpm = function(maxRpm) {
    this.maxRpm = maxRpm;
    console.log('maxRpm set to ' + maxRpm);
};

GatewayOps.prototype.setDailyTokenBudget = function(dailyTokenBudget) {
    this.dailyTokenBudget = dailyTokenBudget;
    console.log('dailyTokenBudget set to ' + dailyTokenBudget);
};

GatewayOps.prototype.stats = function() {
    var counts = { running: 0, done: 0, killed: 0 };
    this._requests.forEach(function(req) {
        if (counts[req.status] !== undefined) {
            counts[req.status]++;
        }
    });
    console.log(
        'requests: running=' + counts.running +
        ' done=' + counts.done +
        ' killed=' + counts.killed
    );
    console.log('indexes: ' + this._indexes.length);
    this.showCaps();
};

var ops = new GatewayOps();

menu
    .configureHistory({
        persist: true,
        path: historyFile,
        sessionMaxEntries: 50,
        maxEntries: 50
    })
    .customHeader(function() {
        process.stdout.write('\n=== AI Gateway Ops ===\n');
        process.stdout.write(
            'open=' + ops.openRequestCount() +
            '  maxRpm=' + ops.maxRpm +
            '  budget=' + ops.dailyTokenBudget +
            '  used=' + ops.tokensUsedToday + '\n'
        );
        process.stdout.write('History: ' + historyFile + '\n\n');
    })
    .customPrompt(function() {
        process.stdout.write('gateway> ');
    })
    .continueCallback(function() {
        ops.cancelInFlight();
    })
    .addDelimiter('-', 40, 'Traffic')
    .addItem('List requests', ops.listRequests, ops)
    .addItem(
        'Get request by id',
        ops.getRequest,
        ops,
        [{ name: 'id', type: 'numeric' }]
    )
    .addItem(
        'Kill request',
        ops.killRequest,
        ops,
        [{ name: 'id', type: 'numeric' }]
    )
    .addDelimiter('-', 40, 'RAG')
    .addItem('List indexes', ops.listIndexes, ops)
    .addItem(
        'Reindex',
        ops.reindex,
        ops,
        [{ name: 'name', type: 'string' }]
    )
    .addItem('Flush cache', ops.flushCache, ops)
    .addItem(
        'Query index',
        ops.queryIndex,
        ops,
        [
            { name: 'name', type: 'string' },
            { name: 'query', type: 'string' }
        ]
    )
    .addDelimiter('-', 40, 'Limits')
    .addItem('Show caps', ops.showCaps, ops)
    .addItem(
        'Set max RPM',
        ops.setMaxRpm,
        ops,
        [{ name: 'maxRpm', type: 'numeric' }]
    )
    .addItem(
        'Set daily token budget',
        ops.setDailyTokenBudget,
        ops,
        [{ name: 'dailyTokenBudget', type: 'numeric' }]
    )
    .addDelimiter('-', 40, 'System')
    .addItem('Stats', ops.stats, ops)
    .start();
