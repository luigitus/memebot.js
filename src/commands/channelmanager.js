var settings = require('../settings.js');

var ChannelManager = function(base) {
  // inherit prototype
  this.p = base;
}

ChannelManager.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'edit' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      var constantSettings = ['_id'];
      if(constantSettings.indexOf(data[2]) != -1) {
        return ['{sender}: You cannot edit this setting!'];
      }

      var obj = channel.p.properties[data[2]];
      if(typeof obj === 'undefined') {
        return ['{sender}: Invalid setting!'];
      }

      if(typeof obj === 'object') {
      } else if(typeof obj === 'number') {
        channel.p.properties[data[2]] = parseFloat(data[3]);
        return ['{sender}: Value edited!'];
      } else if(typeof obj === 'boolean') {
        channel.p.properties[data[2]] = (data[3] == 'true');
        return ['{sender}: Value edited!'];
      } else {
        channel.p.properties[data[2]] = data[3];
        return ['{sender}: Value edited!'];
      }
    } else if(data[1] == 'get' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      // check if command exists for this channel; only first name is valid in this case
      var output = JSON.stringify(channel.p.properties[data[2]]);
      if(typeof output === 'undefined') {
        return ['{sender}: Could not find this item!'];
      }
      return [output];
    } else {
      return ['{sender}: Syntax - !channel edit/get'];
    }
  }
}

module.exports = {
  ChannelManager
}
