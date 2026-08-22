var menu = require('../index');

function JobStore() {
    this._nextId = 1;
    this._jobs = [];
    this.enqueue('reindex-search', 5);
    this._jobs[0].status = 'running';
    this.enqueue('send-digest', 2);
    this.enqueue('purge-temp', 1);
    this._jobs[2].status = 'done';
}

JobStore.prototype.listJobs = function() {
    if (this._jobs.length === 0) {
        console.log('No jobs.');
        return;
    }
    this._jobs.forEach(function(job) {
        console.log(
            '#' + job.id +
            '  ' + job.name +
            '  priority=' + job.priority +
            '  status=' + job.status
        );
    });
};

JobStore.prototype.getJob = function(id) {
    var job = this._find(id);
    if (!job) {
        console.log('Job not found: ' + id);
        return;
    }
    console.log(JSON.stringify(job, null, 2));
};

JobStore.prototype.enqueue = function(name, priority) {
    var job = {
        id: this._nextId++,
        name: name,
        priority: priority,
        status: 'queued'
    };
    this._jobs.push(job);
    console.log('Enqueued job #' + job.id + ' "' + job.name + '"');
};

JobStore.prototype.cancel = function(id) {
    var job = this._find(id);
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

JobStore.prototype._find = function(id) {
    for (var i = 0; i < this._jobs.length; i++) {
        if (this._jobs[i].id === id) {
            return this._jobs[i];
        }
    }
    return null;
};

var store = new JobStore();

menu
    .addDelimiter('-', 40, 'Browse')
    .addItem('List jobs', store.listJobs, store)
    .addItem(
        'Get job by id',
        store.getJob,
        store,
        [{ name: 'id', type: 'numeric' }]
    )
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
