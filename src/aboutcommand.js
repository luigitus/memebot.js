var command = require('./command.js');

module.exports = {
  AboutCommand: {
    init: function() {
      // inherit prototype
      this.__proto__ = command.Command;
      this.__proto__.init();

      this._name = '!about';
    },

    execute: function(params, sender, callback) {
      callback(['memebot standalone experiment about command']);
    }
  },
}
