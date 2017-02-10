var _    = require('underscore');

var MenuType = {
	ACTION     : 1,
	DELIMITER  : 2
};

var MenuItem = function(menuType, number, title, handler, owner, args, callback) {
	var self = this;
	self.title = title;
	self.handler = handler;
	self.menuType = menuType;
	self.number = number;
	self.callback = callback;

	if (menuType === MenuType.DELIMITER) {
		self.delimiter = Array(80).join('-');
	}

	self.owner = owner ? owner : self;
	self.args = args ? args : [];
};

MenuItem.prototype.validate = function(argv) {
	var self  = this;
	var res;

	if (!argv) {
		res = {
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

	res = {
    	lengthMatch: lengthMatch,
    	typesMatch: typesMatch
    };

    return res;
};

MenuItem.prototype.getPrintableString = function() {
	var self = this;
    var res = '';
    var first = true;

    if (self.menuType === MenuType.ACTION) {
    	res = self.title;

	    for (var i = 0; i < self.args.length; ++i) {
	        if (first) {
	            res += ':';
	            first = false;
	        }

	        res += ' "' + self.args[i].name + '"';
	    }
	} else if (self.menuType === MenuType.DELIMITER) {
		res = self.delimiter;
		if (self.title && self.title.length > 0) {
			var l1 = res.length;
			var l2 = self.title.length;
			var pos = l1 / 2 - l2 / 2;
			res = res.substring(0, pos) + self.title + res.substring(pos + l2);
		}
	}
    return res;
};

MenuItem.prototype.setDelimiter = function(delimiter, cnt, title) {
	var self = this;
	self.delimiter = Array(cnt).join(delimiter);
	self.title = title;
};

module.exports = MenuItem;
module.exports.MenuType = MenuType;
