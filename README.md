node-menu
=========

This modules allows to create cosole menues for your application. The first version is simple enough, it allows you to register menu items with their handlers.

## Installation

    npm install node-menu

## Usage

```javascript
var menu = require('node-menu');

menu.addItem("First Item", function() {
    console.log("First item log");
});

menu.addItem("Second Item", function() {
    console.log("Second item log");
});

menu.start();
```

## To be continued...