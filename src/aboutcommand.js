var command = require('./command.js');

module.exports = {
  AboutCommand: {
    init: function() {
      // inherit prototype
      this.__proto__ = command.Command;
      this.__proto__.init();
    }
  },
}
