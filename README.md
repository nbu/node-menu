node-menu
=========

This module allows to create console menu for your REPL application. It allows you to register menu items with their handlers. Optionally you may provide handler's owner object and list of arguments being passed to handler.

## Installation

    npm install node-menu

## Methods

```javascript
var menu = require('node-menu');
```

### menu.addItem(title, handler, owner, args)

Add item to the menu. 

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

### menu.start()

Start menu.

## Example

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

menu.addItem(
    'No parameters', 
    function() {
        console.log('No parameters is invoked');
    });

menu.addItem(
    "Print Field A",
    testObject.printFieldA,
    testObject);

menu.addItem(
    'Print Field B concatenated with arg1',
    testObject.printFieldB,
    testObject,
    [{'name': 'arg1', 'type': 'string'}]);

menu.addItem(
    'Sum', 
    function(op1, op2) {
        var sum = op1 + op2;
        console.log('Sum ' + op1 + '+' + op2 + '=' + sum);
    },
    null, 
    [{'name': 'op1', 'type': 'numeric'}, {'name': 'op2', 'type': 'numeric'}]);

menu.addItem(
    'String and Bool parameters', 
    function(str, b) {
        console.log("String is: " + str);
        console.log("Bool is: " + b);
    },
    null,
    [{'name': 'str', 'type': 'string'}, {'name': 'bool', 'type': 'bool'}]);


menu.start();
```

Output of this example:

        _   __            __       __  ___
       / | / /____   ____/ /___   /  |/  /___   ____   __  __
      /  |/ // __ \ / __  // _ \ / /|_/ // _ \ / __ \ / / / /
     / /|  // /_/ // /_/ //  __// /  / //  __// / / // /_/ /
    /_/ |_/ \____/ \__,_/ \___//_/  /_/ \___//_/ /_/ \__,_/  v.0.0.7
    
    
    1. No parameters
    2. Print Field A
    3. Print Field B concatenated with arg1: "arg1"
    4. Sum: "op1" "op2"
    5. String and Bool parameters: "str" "bool"
    6. Quit
    
    Please provide input at prompt as: >> ItemNumber arg1 arg2 ... (i.e. >> 2 "string with spaces" 2 4 noSpacesString true)
      
    >> 

To invoke item without arguments just type number and Enter. To invoke item with arguments, type number then arguments delimited with space. If string argument has spaces it must be double quoted.

## To be continued...