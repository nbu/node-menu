var MenuItem = function(title, handler, owner, args) {
	var self = this;
	self.title = title;
	self.handler = handler;
	owner ? self.owner = owner : self.owner = self;
	args ? self.args = args : self.args = [];
};

MenuItem.prototype.validate = function(argv) {
	var self  = this;

	if (!argv) {
		return false;
	}

    return self.args.length == argv.length;
}

MenuItem.prototype.buildArgsTitle = function() {
	var self = this;
    var res = '';
    var first = true;

    for (var i = 0; i < self.args.length; ++i) {
        if (first) {
            res = ':';
            first = false;
        }

        res += ' "' + self.args[i] + '"';
    }

    return res;
};

module.exports = MenuItem;
