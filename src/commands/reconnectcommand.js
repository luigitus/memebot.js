var settings = require('../settings.js');

var ReconnectCommand = function(base) {
  // inherit prototype
  this.p = base;
}

ReconnectCommand.prototype = {
  execute: function(data, channel, sender) {
    if(settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 100)) {
      channel.closeConnection();
      channel.checkReconnect();
    }
    return ['{sender}: Unauthorized MrDestructoid'];
  }
}

module.exports = {
  ReconnectCommand
}
