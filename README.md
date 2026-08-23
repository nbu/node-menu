node-menu
=========

Create interactive console menus for REPL-style and ops Node.js apps. Register menu items with handlers, optional `this` owners, and typed arguments (`string`, `numeric`, `bool`).

## Installation

```bash
npm install node-menu
```

## Quickstart — Background jobs console

Run the full example:

```bash
node examples/admin-jobs.js
```

A trimmed version of the same idea (full store + get-by-id live in `examples/admin-jobs.js`):

```javascript
var menu = require('node-menu');

function JobStore() {
    this._nextId = 1;
    this._jobs = [];
}

JobStore.prototype.listJobs = function() {
    this._jobs.forEach(function(job) {
        console.log('#' + job.id + ' ' + job.name + ' [' + job.status + ']');
    });
};

JobStore.prototype.enqueue = function(name, priority) {
    var job = {
        id: this._nextId++,
        name: name,
        priority: priority,
        status: 'queued'
    };
    this._jobs.push(job);
    console.log('Enqueued job #' + job.id);
};

JobStore.prototype.cancel = function(id) {
    var job = null;
    for (var i = 0; i < this._jobs.length; i++) {
        if (this._jobs[i].id === id) {
            job = this._jobs[i];
            break;
        }
    }
    if (!job) {
        console.log('Job not found: ' + id);
        return;
    }
    if (job.status === 'done' || job.status === 'cancelled') {
        console.log('Cannot cancel job #' + id + ' (status=' + job.status + ')');
        return;
    }
    job.status = 'cancelled';
    console.log('Cancelled job #' + id);
};

JobStore.prototype.stats = function() {
    var counts = { queued: 0, running: 0, done: 0, cancelled: 0 };
    this._jobs.forEach(function(job) {
        if (counts[job.status] !== undefined) {
            counts[job.status]++;
        }
    });
    console.log(
        'queued=' + counts.queued +
        ' running=' + counts.running +
        ' done=' + counts.done +
        ' cancelled=' + counts.cancelled
    );
};

var store = new JobStore();

menu
    .addDelimiter('-', 40, 'Browse')
    .addItem('List jobs', store.listJobs, store)
    .addDelimiter('-', 40, 'Mutate')
    .addItem(
        'Enqueue job',
        store.enqueue,
        store,
        [
            { name: 'name', type: 'string' },
            { name: 'priority', type: 'numeric' }
        ]
    )
    .addItem(
        'Cancel job',
        store.cancel,
        store,
        [{ name: 'id', type: 'numeric' }]
    )
    .addDelimiter('-', 40, 'System')
    .addItem('Stats', store.stats, store)
    .start();
```

Sample session from `examples/admin-jobs.js` (abridged):

```text
----------------Browse-----------------
1. List jobs
2. Get job by id: "id"
----------------Mutate-----------------
3. Enqueue job: "name" "priority"
4. Cancel job: "id"
----------------System-----------------
5. Stats
6. Quit

>> 3 "resize-images" 8
Enqueued job #4 "resize-images"
Press Enter to continue...

>> 1
#1  reindex-search  priority=5  status=running
#2  send-digest  priority=2  status=queued
#3  purge-temp  priority=1  status=done
#4  resize-images  priority=8  status=queued
```

Invoke an item with no arguments by typing its number. For arguments, type the number then values separated by spaces. Quote strings that contain spaces.

## Examples

| File | What it shows |
|------|----------------|
| `examples/admin-jobs.js` | In-memory job store: list, get, enqueue, cancel, stats (`owner` + typed args) |
| `examples/custom-chrome.js` | `customHeader` and `customPrompt` |
| `examples/cancel-job.js` | Long-running work cancelled via `continueCallback` when Enter is pressed |
| `examples/history-persist.js` | Optional command history persistence (`configureHistory`) |
| `examples/ai-gateway-ops.js` | AI gateway / RAG ops: traffic, indexes, caps; custom chrome, cancel-in-flight, history persist |

### AI gateway / RAG ops console

Simulated internal ops console for a Node AI gateway (traffic, RAG indexes, rate/cost caps) — not a model CLI like Ollama.

```bash
node examples/ai-gateway-ops.js
```

Sample session (abridged):

```text
=== AI Gateway Ops ===
open=1  maxRpm=60  budget=100000  used=12500

---------------Traffic----------------
1. List requests
2. Get request by id: "id"
3. Kill request: "id"
-----------------RAG------------------
4. List indexes
5. Reindex: "name"
6. Flush cache
7. Query index: "name" "query"
----------------Limits----------------
8. Show caps
9. Set max RPM: "maxRpm"
10. Set daily token budget: "dailyTokenBudget"
----------------System----------------
11. Stats
12. Quit

gateway> 3 1
Killed request #1

gateway> 7 docs "rate limits"
Query "rate limits" on index "docs":
  1. [0.92] Matching chunk about: rate limits
  2. [0.81] Related note in docs
```

Full script: `examples/ai-gateway-ops.js`.

## Methods

```javascript
var menu = require('node-menu');
```

Chaining methods (`addItem`, `addDelimiter`, `customHeader`, and so on) return the menu object. `start()` starts the menu and does not return a value for chaining.

### menu.addItem(title, handler, owner, args)

Add an item to the menu.

- _title_ — title of the menu item
- _handler_ — item handler function
- _owner_ — owner object for the handler (`this`); optional
- _args_ — array of `{ name, type }` argument descriptors. Types: `numeric`, `bool`, `string`

```javascript
menu.addItem(
    'Enqueue job',
    store.enqueue,
    store,
    [
        { name: 'name', type: 'string' },
        { name: 'priority', type: 'numeric' }
    ]
);
```

### menu.addDelimiter(delimiter, cnt, title)

Add a delimiter line. _title_ is printed in the middle when provided.

```text
menu.addDelimiter('-', 33, 'Main Menu')
------------Main Menu------------

menu.addDelimiter('*', 33)
*********************************
```

### menu.enableDefaultHeader()

Turn on the default header (on by default).

### menu.disableDefaultHeader()

Turn off the default header.

### menu.customHeader(customHeaderFunc)

Turn off the default header and print a custom header via the callback.

```javascript
menu.customHeader(function() {
    process.stdout.write('\nCustom header\n');
});
```

### menu.enableDefaultPrompt()

Turn on the default prompt (on by default).

### menu.disableDefaultPrompt()

Turn off the default prompt.

### menu.customPrompt(customPromptFunc)

Turn off the default prompt and print a custom prompt via the callback.

```javascript
menu.customPrompt(function() {
    process.stdout.write('Select an action > ');
});
```

### menu.resetMenu()

Clear menu data and listeners so the object can be rebuilt and reused.

### menu.continueCallback(continueCallback)

Set a callback invoked when Enter is pressed on the “Press Enter to continue…” step (useful to cancel in-flight work).

```javascript
menu.continueCallback(function() {
    console.log('Continuing...');
});
```

### menu.configureHistory(options)

Configure in-session command history and optional persistence across restarts. In-session history is always on: every non-empty `>>` line is recorded for up/down recall, with whole-list dedupe (most recent wins) and a default cap of 100 entries (`sessionMaxEntries`).

Persistence is off by default. When `persist: true`, only validated handler runs that complete without throwing are saved. The default file path is `~/.node-menu_history`; the persisted list defaults to 100 entries (`maxEntries`).

- _sessionMaxEntries_ — max in-session history entries; default 100
- _persist_ — save successful commands to disk; default false
- _path_ — history file path when persisting; default `~/.node-menu_history`
- _maxEntries_ — max persisted entries; default 100

```javascript
menu.configureHistory({
    sessionMaxEntries: 100,
    persist: true,
    path: '/tmp/my-menu-history',
    maxEntries: 100
});
```

### menu.start()

Start the menu (also registers a Quit item).
