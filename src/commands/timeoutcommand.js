var text = require('../text.js');

var TimeoutCommand = function(base) {
  // inherit prototype
  this.p = base;
  this.p.p.setDefaults({timeoutDuration : 1, timeoutCommand : '{sender}', timeoutReason: '{appname} auto-timeout!'});
}

TimeoutCommand.prototype = {
  execute: function(data, channel, sender) {
    tocommand = text.formatText(this.p.p.properties.timeoutCommand, false, channel, sender, this.p, data);
    toreason = text.formatText(this.p.p.properties.timeoutReason, false, channel, sender, this.p, data);
    channel.connection.sendCommand('/timeout ' + tocommand + ' ' + this.p.p.properties.timeoutDuration + ' ' +
    + ' ' + toreason, channel.p.properties.channel);
    return [''];
  }
}

module.exports = {
  TimeoutCommand
}
