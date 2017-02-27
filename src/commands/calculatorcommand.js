var math = require('mathjs');
var settings = require('../settings.js');

var CalculatorCommand = function(base) {
  // inherit prototype
  this.p = base;
}

CalculatorCommand.prototype = {
  execute: function(data, channel, sender) {

    var toEval = data.slice(1);
    var output = '{sender}: ' + settings.evalExpression(toEval).e;

    return [output];
  }
}

module.exports = {
  CalculatorCommand
}
