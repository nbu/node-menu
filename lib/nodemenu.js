/**
 * Created by bnebosen on 4/15/2014.
 */
var MenuItem = require('./menuitem');
var MenuType = MenuItem.MenuType;
var _    = require('underscore');

var NodeMenu = function() {
    var self = this;

    self.CLEAR_CODE = "\u001b[2J\u001b[0;0H";

    self.consoleOutput = console.log;
    self.menuItems = [];
    self.waitToContinue = false;
    self.itemNo = 0;
    self.printDefaultHeader = true;
    self.printDefaultPrompt = true;
};

NodeMenu.prototype.enableDefaultHeader = function() {
    var self = this;
    self.printDefaultHeader = true;
    return self;
};

NodeMenu.prototype.disableDefaultHeader = function() {
    var self = this;
    self.printDefaultHeader = false;
    return self;
};

NodeMenu.prototype.customHeader = function(customHeaderFunc) {
    var self = this;
    self.printDefaultHeader = false;
    self.customHeaderFunc = customHeaderFunc;
    return self;
};

NodeMenu.prototype.enableDefaultPrompt = function() {
    var self = this;
    self.printDefaultPrompt = true;
    return self;
};

NodeMenu.prototype.disableDefaultPrompt = function() {
    var self = this;
    self.printDefaultPrompt = false;
    return self;
};

NodeMenu.prototype.customPrompt = function(customPromptFunc) {
    var self = this;
    self.printDefaultPrompt = false;
    self.customPromptFunc = customPromptFunc;
    return self;
};

NodeMenu.prototype.resetMenu = function() {
    var self = this;
    self.menuItems = [];
    self.waitToContinue = false;
    self.itemNo = 0;
    process.stdin.removeAllListeners('data');
    return self;
};

NodeMenu.prototype.continueCallback = function(continueCallback) {
    var self = this;
    self.continueCallback = continueCallback && _.isFunction(continueCallback) ? continueCallback : undefined;
    return self;
};

NodeMenu.prototype.addItem = function(title, handler, owner, args) {
    var self = this;
    self.menuItems.push(new MenuItem(MenuType.ACTION, ++self.itemNo, title, handler, owner, args));
    return self;
};

NodeMenu.prototype.addDelimiter = function(delimiter, cnt, title) {
    var self = this;
    var menuItem = new MenuItem(MenuType.DELIMITER);
    if (delimiter) {
        menuItem.setDelimiter(delimiter, cnt, title);
    }

    self.menuItems.push(menuItem);
    return self;
};

NodeMenu.prototype.start = function() {
    var self = this;
    self.addItem('Quit', function() {
        process.stdin.end();
        process.exit();
    });

    self._printMenu();

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(text) {
        var args = self._parseInput(text);
        var item = null;
        if (args && ('itemNo' in args)) {
            for (var i = 0; i < self.menuItems.length; ++i) {
                if (self.menuItems[i].number == args.itemNo) {
                    item = self.menuItems[i];
                    break;
                }
            }
        }

        if (self.waitToContinue) {
            if (self.continueCallback) {
                self.continueCallback();
            }

            self._printMenu();
            self.waitToContinue = false;
            return;
        }

        if (!item) {
            self.consoleOutput('Command not found: ' + text);
        } else {
            var valid = item.validate(args.argv);
            if (!valid.lengthMatch) {
                self.consoleOutput('Invalid number of input parameters');
            } else if (!valid.typesMatch) {
                self.consoleOutput('Invalid types of input parameters');
            } else {
                item.handler.apply(item.owner, args.argv);
            }
        }

        self.consoleOutput('Press Enter to continue...');
        self.waitToContinue = true;
    });
};

NodeMenu.prototype._parseInput = function(text) {
    var self = this;

    var patt=/(".*?")|([^\s]{1,})/g;
    var match = text.match(patt);
    var res = null;

    if (match && match.length > 0) {
        if (isNaN(match[0])) {
            self.consoleOutput("Invalid item number");
            return res;
        }

        res = {};
        res.itemNo = parseInt(match[0]);
        res.argv = match.slice(1);
        for (var i = 0; i < res.argv.length; ++i) {
            res.argv[i] = res.argv[i].replace(/"/g, '');
            if (res.argv[i].trim !== '') {
                var num = Number(res.argv[i]);
                if (!isNaN(num)) {
                    res.argv[i] = num;
                } else if (res.argv[i] === 'true' || res.argv[i] === 'false') {
                    res.argv[i] = (res.argv[i] === 'true');
                }
            }
        }
    }

    return res;
};

NodeMenu.prototype._printHeader = function() {
    var self = this;

    if (self.printDefaultHeader) {
        process.stdout.write("                                                \n\
            _   __            __       __  ___                                \n\
           / | / /____   ____/ /___   /  |/  /___   ____   __  __             \n\
          /  |/ // __ \\ / __  // _ \\ / /|_/ // _ \\ / __ \\ / / / /         \n\
         / /|  // /_/ // /_/ //  __// /  / //  __// / / // /_/ /              \n\
        /_/ |_/ \\____/ \\__,_/ \\___//_/  /_/ \\___//_/ /_/ \\__,_/  v.1.0.0 \n\
                                                                              \n\
                                                                              \n");
    } else if (_.isFunction(self.customHeaderFunc)) {
        self.customHeaderFunc();
    }
};

NodeMenu.prototype._printPrompt = function() {
    var self = this;

    if (self.printDefaultPrompt) {
        self.consoleOutput('\nPlease provide input at prompt as: >> ItemNumber arg1 arg2 ... (i.e. >> 2 "string with spaces" 2 4 noSpacesString true)');
    } else if (_.isFunction(self.customPromptFunc)) {
        self.customPromptFunc();
    }
};

NodeMenu.prototype._printMenu = function() {
    var self = this;

    console.log(self.CLEAR_CODE);

    self._printHeader();
    for (var i = 0; i < self.menuItems.length; ++i) {
        var menuItem = self.menuItems[i];
        printableMenu = menuItem.getPrintableString();
        if (menuItem.menuType === MenuType.ACTION) {
            self.consoleOutput(menuItem.number + ". " + printableMenu);
        } else if (menuItem.menuType === MenuType.DELIMITER) {
            self.consoleOutput(printableMenu);
        }
    }

    self._printPrompt();

    process.stdout.write("\n>> ");
};

module.exports = new NodeMenu();
