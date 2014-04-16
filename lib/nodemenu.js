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

    process.stdout.write("                                                \n\
        _   __            __       __  ___                                \n\
       / | / /____   ____/ /___   /  |/  /___   ____   __  __             \n\
      /  |/ // __ \\ / __  // _ \\ / /|_/ // _ \\ / __ \\ / / / /         \n\
     / /|  // /_/ // /_/ //  __// /  / //  __// / / // /_/ /              \n\
    /_/ |_/ \\____/ \\__,_/ \\___//_/  /_/ \\___//_/ /_/ \\__,_/          \n\
                                                                          \n\
                                                                          \n");
};

NodeMenu.prototype.addItem = function(title, funct) {
    var self = this;
    self.menuItems.push({
        title: title,
        funct: funct
    });
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
        var item = self.menuItems[parseInt(text) - 1];

        if (self.waitToContinue) {
            self._printMenu();
            self.waitToContinue = false;
            return;
        }

        if (!item) {
            consoleOutput("Command not found: " + text + "\n");
        } else {
            consoleOutput("");
            item.funct();
        }

        consoleOutput("\nPress Enter to continue...");
        self.waitToContinue = true;
    });
};

NodeMenu.prototype._printMenu = function() {
    util.print(CLEAR_CODE);
    var self = this;
    for (var i = 0; i < self.menuItems.length; ++i) {
        consoleOutput((i + 1) + ". " + self.menuItems[i].title);
    }

    process.stdout.write("\n>> ");
};

module.exports = new NodeMenu();
