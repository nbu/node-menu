/**
 * Created by bnebosen on 4/15/2014.
 */
var util = require('util');
var consoleOutput = console.log;
var CLEAR_CODE = "\u001b[2J\u001b[0;0H";

var NodeMenu = function() {
    var self = this;

    self.menuItems = [];
    self.waitToContinue = false;
};

NodeMenu.prototype.addItem = function(title, funct, args) {
    var self = this;
    var item = {
        title: title,
        funct: funct,
    };

    if (args) {
        item.args = args;
    }

    self.menuItems.push(item);
};

NodeMenu.prototype.start = function() {
    var self = this;
    self.addItem("Quit", function() {
        process.exit();
    });

    self._printMenu();

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(text) {
        var args = self._parseInput(text);
        var item = null;
        if (args && ('itemNo' in args)) {
            item = self.menuItems[args.itemNo - 1];
        }

        if (self.waitToContinue) {
            self._printMenu();
            self.waitToContinue = false;
            return;
        }

        if (!item) {
            consoleOutput("Command not found: " + text);
        } else {
            var valid = self._validate(item, args.argv);
            if (!valid) {
                consoleOutput("Invalid number of input parameters");
            } else {
                item.funct.apply(item, args.argv);
            }
        }

        consoleOutput("Press Enter to continue...");
        self.waitToContinue = true;
    });
};

NodeMenu.prototype._validate = function(item, argv) {
    if (!item || !argv) {
        return false;
    }

    if (!('args' in item)) {
        return argv.length == 0;
    }

    return item.args.length == argv.length;
}

NodeMenu.prototype._parseInput = function(text) {
    var patt = /^\d{1,}/;
    var match = text.match(patt);
    var res = null;

    if (match && match.length == 1) {
        res = {};
        res.itemNo = parseInt(match[0]);
        var args = text.substring(match[0].length);

        try {
            res.argv = JSON.parse("[ " + args + " ]");
        } catch (ex) {
            consoleOutput("Invalid input parameters");
        }
    } 

    return res;
};

NodeMenu.prototype._printHeader = function() {
    process.stdout.write("                                                \n\
        _   __            __       __  ___                                \n\
       / | / /____   ____/ /___   /  |/  /___   ____   __  __             \n\
      /  |/ // __ \\ / __  // _ \\ / /|_/ // _ \\ / __ \\ / / / /         \n\
     / /|  // /_/ // /_/ //  __// /  / //  __// / / // /_/ /              \n\
    /_/ |_/ \\____/ \\__,_/ \\___//_/  /_/ \\___//_/ /_/ \\__,_/  v.0.0.3 \n\
                                                                          \n\
                                                                          \n");
};

NodeMenu.prototype._printMenu = function() {
    util.print(CLEAR_CODE);
    var self = this;
    self._printHeader();
    for (var i = 0; i < self.menuItems.length; ++i) {
        args = self._buildArgsTitle(self.menuItems[i]);
        consoleOutput((i + 1) + ". " + self.menuItems[i].title + args);
    }

    consoleOutput('\nPlease provide input at promt as: >> ItemNumber arg1, arg2 ... (i.e. >> 2 "some string", 2, 4, true)');

    process.stdout.write("\n>> ");
};

NodeMenu.prototype._buildArgsTitle = function(item) {
    var res = '';
    if (item && ('args' in item)) {
        var first = true;
        for (var i = 0; i < item.args.length; ++i) {
            if (first) {
                res = ':';
                first = false;
            }

            res += ' "' + item.args[i] + '"';
        }
    } 

    return res;
};

module.exports = new NodeMenu();
