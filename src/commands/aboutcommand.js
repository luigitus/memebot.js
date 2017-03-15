var command = require('../command.js');

var AboutCommand = function(base) {
  this.p = base;
}

AboutCommand.prototype = {
  execute: function(data, channel, sender) {
    return ['@{sender}: {appname} {version} developed by {dev}. Fork me on github: {git}'];
  }
}

module.exports = {
  AboutCommand
}
