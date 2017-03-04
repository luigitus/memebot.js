var settings = require('../settings.js');

var QuitCommand = function(base) {
  // inherit prototype
  this.p = base;
}

QuitCommand.prototype = {
  execute: function(data, channel, sender) {
    if(!settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 100)) {
      return ['{sender}: Unauthorized!']
    }
    process.exit();
  }
}

module.exports = {
  QuitCommand
}
