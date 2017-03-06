var text = require('../text.js');

var BanCommand = function(base) {
  // inherit prototype
  this.p = base;
  this.p.p.setDefaults({banCommand : '{sender}', banReason: '{appname} auto-ban'});
}

BanCommand.prototype = {
  execute: function(data, channel, sender) {
    banCommand = text.formatText(this.p.p.properties.banCommand, false, channel, sender, this.p, data);
    banReason = text.formatText(this.p.p.properties.banReason, false, channel, sender, this.p, data);
    channel.connection.sendCommand('/ban ' + banCommand
    + ' ' + banReason, channel.p.properties.channel);
    return [''];
  }
}

module.exports = {
  BanCommand
}
