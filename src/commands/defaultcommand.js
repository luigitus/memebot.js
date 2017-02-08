var command = require('../command.js');
var text = require('../text.js');

module.exports = {
  DefaultCommand: {
    init: function(base) {
      // inherit prototype
      this.p = base;
    },

    execute: function(data, channel, sender) {
      return this.p.p.properties.output;
    }
  },
}
