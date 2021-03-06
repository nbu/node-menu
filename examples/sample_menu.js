var menu = require('../index');

var TestObject = function() {
    var self = this;
    self.fieldA = 'FieldA';
    self.fieldB = 'FieldB';
};

TestObject.prototype.printFieldA = function() {
    console.log(this.fieldA);
};

TestObject.prototype.printFieldB = function(arg) {
    console.log(this.fieldB + arg);
};

var testObject = new TestObject();
var timeout;

menu.addDelimiter('-', 40, 'Main Menu')
    .addItem(
        'No parameters',
        function() {
            console.log('No parameters is invoked');
        })
    .addItem(
        "Print Field A",
        testObject.printFieldA,
        testObject)
    .addItem(
        'Print Field B concatenated with arg1',
        testObject.printFieldB,
        testObject,
        [{'name': 'arg1', 'type': 'string'}])
    .addItem(
        'Sum',
        function(op1, op2) {
            var sum = op1 + op2;
            console.log('Sum ' + op1 + '+' + op2 + '=' + sum);
        },
        null,
        [{'name': 'op1', 'type': 'numeric'}, {'name': 'op2', 'type': 'numeric'}])
    .addItem(
        'String and Bool parameters',
        function(str, b) {
            console.log("String is: " + str);
            console.log("Bool is: " + b);
        },
        null,
        [{'name': 'str', 'type': 'string'}, {'name': 'bool', 'type': 'bool'}])
    .addItem(
        'Long lasting task which is terminated when Enter pressed',
        function(time) {
            console.log("Starting long lasting job for " + time + " sec");
            timeout = setTimeout(function() {
                console.log("Long lasting job is done");
                timeout = undefined;
            }, time * 1000);
        },
        null,
        [{'name': 'Job execution time, sec', 'type': 'numeric'}])
    .addDelimiter('*', 40)
    .continueCallback(function () {
        if (timeout) {
            clearTimeout(timeout);
            console.log("Timeout cleaned");
            timeout = undefined;
        }
    })
    // .customHeader(function() {
    //     process.stdout.write("Hello\n");
    // })
    // .disableDefaultHeader()
    // .customPrompt(function() {
    //     process.stdout.write("\nEnter your selection:\n");
    // })
    // .disableDefaultPrompt()
    .start();
