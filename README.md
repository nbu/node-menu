node-menu
=========

This module allows to create console menu for your REPL application. It allows you to register menu items with their handlers. Optionally you may provide handler's owner object and list of arguments being passed to handler.

## Installation

    npm install node-menu

## Methods

```javascript
var menu = require('node-menu');
```

Each method returns reference on self object, so calls could be chained.

### menu.addItem(title, handler, owner, args)

Add item to the menu. Returns __menu__ for chaining calls.

- _title_ - title of the menu item;
- _handler_ - item handler function;
- _owner_ - owner object of the function (this);
- _args_ - array of objects argument names being passed to the function, argument is an object with two fields: 'name' and 'type'. Available types are: 'numeric', 'bool' and 'string';

```javascript
menu.addItem(
    'Menu Item',
    function(str, bool, num1, num2) {
        console.log('String: ' + str);
        if (bool) {
            console.log('bool is true');
        } else {
            console.log('bool is false');
        }
        var sum = num1 + num2;
        console.log('num1 + num2: ' + sum);
    },
    null,
    [
        {'name': 'Str Arg', 'type': 'string'},
        {'name': 'Bool Arg', 'type': 'bool'},
        {'name': 'num1', 'type': 'numeric'},
        {'name': 'num2', 'type': 'numeric'}
    ]);
```

### menu.addDelimiter(delimiter, cnt, title)

Adds delimiter to the menu. Returns __menu__ for chaining calls.

- _delimiter_ - delimiter character;
- _cnt_ - delimiter's repetition count;
- _title_ - title of the delimiter, will be printed in the middle of the delimiter line;

The output of the delimiter:

    menu.addDelimiter('-', 33, 'Main Menu')
    ------------Main Menu------------

    menu.addDelimiter('*', 33)
    *********************************

### menu.enableDefaultHeader()

Turns on default header (turned on by default). Returns __menu__ for chaining calls.

```javascript
menu.enableDefaultHeader()
```

### menu.disableDefaultHeader()

Turns off default header. No header will be printed in this case. Returns __menu__ for chaining calls.

```javascript
menu.disableDefaultHeader()
```

### menu.customHeader(customHeaderFunc)

Turns off default header and prints custom header passed in __customHeaderFunc__. Returns __menu__ for chaining calls.

```javascript
menu.customHeader(function() {
    process.stdout.write("\nCustom header\n");
})
```

### menu.enableDefaultPrompt()

Turns on default prompt (turned on by default). Returns __menu__ for chaining calls.

```javascript
menu.enableDefaultPrompt()
```

### menu.disableDefaultPrompt()

Turns off default prompt. No prompt will be printed in this case. Returns __menu__ for chaining calls.

```javascript
menu.disableDefaultPrompt()
```

### menu.customPrompt(customPromptFunc)

Turns off default prompt and prints custom header passed in __customPromptFunc__. Returns __menu__ for chaining calls.

```javascript
menu.customPrompt(function() {
    process.stdout.write("Custom prompt\n");
})
```

### menu.resetMenu()

Clears all data and listeners from the menu object so the object can be updated and reused.

### menu.continueCallback(continueCallback)

Set callback which must be invoked when "Enter" button pressed to continue.

```javascript
menu.resetMenu()
```

### menu.start()

Start menu.

## Example

## Live Example

<a href="http://runnable.com/U1H42Un5ZlsFdb2x/console-menu-for-your-cool-repl-application-for-shell-and-cli" target="_blank"><img src="https://code.runnable.com/external/styles/assets/runnablebtn.png" style="width:67px;height:25px;"></a>

## Source

```javascript
var menu = require('node-menu');

var TestObject = function() {
    var self = this;
    self.fieldA = 'FieldA';
    self.fieldB = 'FieldB';
}

TestObject.prototype.printFieldA = function() {
    console.log(this.fieldA);
}

TestObject.prototype.printFieldB = function(arg) {
    console.log(this.fieldB + arg);
}

var testObject = new TestObject();

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
    .addDelimiter('*', 40)
    // .customHeader(function() {
    //     process.stdout.write("Hello\n");
    // })
    // .disableDefaultHeader()
    // .customPrompt(function() {
    //     process.stdout.write("\nEnter your selection:\n");
    // })
    // .disableDefaultPrompt()
    .start();
```

Output of this example:

        _   __            __       __  ___
       / | / /____   ____/ /___   /  |/  /___   ____   __  __
      /  |/ // __ \ / __  // _ \ / /|_/ // _ \ / __ \ / / / /
     / /|  // /_/ // /_/ //  __// /  / //  __// / / // /_/ /
    /_/ |_/ \____/ \__,_/ \___//_/  /_/ \___//_/ /_/ \__,_/  v.1.0.0

    ---------------Main Menu---------------
    1. No parameters
    2. Print Field A
    3. Print Field B concatenated with arg1: "arg1"
    4. Sum: "op1" "op2"
    5. String and Bool parameters: "str" "bool"
    ***************************************
    6. Quit

    Please provide input at prompt as: >> ItemNumber arg1 arg2 ... (i.e. >> 2 "string with spaces" 2 4 noSpacesString true)

    >>

To invoke item without arguments just type number and Enter. To invoke item with arguments, type number then arguments delimited with space. If string argument has spaces it must be double quoted.
