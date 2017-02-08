var command = require('./command.js');

module.exports = {
  DefaultCommand: {
    init: function(base) {
      // inherit prototype
      this.p = base;
    },

    execute: function(data, channel, sender) {
      return ['memebot standalone experiment default command'];
    }
  },
}
