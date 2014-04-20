var _    = require('underscore');

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
		var res = {
	    	lengthMatch: false, 
	    	typesMatch: null
	    };

		return res;
	}

	var lengthMatch = self.args.length == argv.length;
	var typesMatch = true;

	for (var i = 0; i < self.args.length; ++i) {
		if (self.args[i].type === 'numeric') {
			if (!_.isFinite(argv[i])) {
				typesMatch = false;
				break;
			}
		} else if (self.args[i].type === 'bool') {
			if (!_.isBoolean(argv[i])) {
				typesMatch = false;
				break;
			}
		} else if (self.args[i].type !== 'string') {
			typesMatch = false;
		}
	}

	var res = {
    	lengthMatch: lengthMatch, 
    	typesMatch: typesMatch
    };

    return res; 
};

MenuItem.prototype.buildArgsTitle = function() {
	var self = this;
    var res = '';
    var first = true;

    for (var i = 0; i < self.args.length; ++i) {
        if (first) {
            res = ':';
            first = false;
        }

        res += ' "' + self.args[i].name + '"';
    }

    return res;
};

module.exports = MenuItem;
