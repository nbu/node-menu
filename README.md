node-menu
=========

This modules allows to create cosole menues for your application. The first version is simple enough, it allows you to register menu items with their handlers.

## Installation

    npm install node-menu

## Usage

```javascript
var menu = require('node-menu');

menu.addItem(
    "No parameters", 
    function() {
        console.log("No parameters is invoked");
    });

menu.addItem(
    "Sum", 
    function(op1, op2) {
        var sum = op1 + op2;
        console.log("Sum " + op1 + "+" + op2 + "=" + sum);
    }, 
    ["op1", "op2"]);

menu.addItem(
    "String and Bool parameters", 
    function(str, b) {
        console.log("String is: " + str);
        console.log("Bool is: " + b);
    },
    ["str", "bool"]);
menu.start();
```

## To be continued...