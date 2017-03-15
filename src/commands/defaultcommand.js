var text = require('../text.js');

var DefaultCommand = function(base) {
  // inherit prototype
  this.p = base;
}

DefaultCommand.prototype = {
  execute: function(data, channel, sender) {
    return this.p.p.properties.output;
  }
}

module.exports = {
  DefaultCommand
}
