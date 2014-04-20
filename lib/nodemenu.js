/**
 * Created by bnebosen on 4/15/2014.
 */
var util = require('util');
var MenuItem = require('./menuitem');
var consoleOutput = console.log;
var CLEAR_CODE = "\u001b[2J\u001b[0;0H";

var NodeMenu = function() {
    var self = this;

    self.menuItems = [];
    self.waitToContinue = false;
};

NodeMenu.prototype.addItem = function(title, handler, owner, args) {
    var self = this;
    self.menuItems.push(new MenuItem(title, handler, owner, args));
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
            var valid = item.validate(args.argv);
            if (!valid) {
                consoleOutput("Invalid number of input parameters");
            } else {
                item.handler.apply(item.owner, args.argv);
            }
        }

        consoleOutput("Press Enter to continue...");
        self.waitToContinue = true;
    });
};

NodeMenu.prototype._parseInput = function(text) {
    var patt=/(".*?")|([^\s]{1,})/g;
    var match = text.match(patt);
    var res = null;

    if (match && match.length > 0) {
        if (isNaN(match[0])) {
            consoleOutput("Invalid item number");
            return res;
        }

        res = {};
        res.itemNo = parseInt(match[0]);
        res.argv = match.slice(1);
        for (var i = 0; i < res.argv.length; ++i) {
            res.argv[i] = res.argv[i].replace(/"/g, '');
            if (res.argv[i].trim != '') {
                var num = Number(res.argv[i]);
                if (!isNaN(num)) {
                    res.argv[i] = num;
                }
            } else if (res.argv[i] === 'true' || res.argv[i] === 'false') {
                res.argv[i] = res.argv[i] === 'true';
            }
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
    /_/ |_/ \\____/ \\__,_/ \\___//_/  /_/ \\___//_/ /_/ \\__,_/  v.0.0.6 \n\
                                                                          \n\
                                                                          \n");
};

NodeMenu.prototype._printMenu = function() {
    util.print(CLEAR_CODE);
    var self = this;
    self._printHeader();
    for (var i = 0; i < self.menuItems.length; ++i) {
        args = self.menuItems[i].buildArgsTitle();
        consoleOutput((i + 1) + ". " + self.menuItems[i].title + args);
    }

    consoleOutput('\nPlease provide input at prompt as: >> ItemNumber arg1 arg2 ... (i.e. >> 2 "string with spaces" 2 4 noSpacesString true)');

    process.stdout.write("\n>> ");
};

module.exports = new NodeMenu();
