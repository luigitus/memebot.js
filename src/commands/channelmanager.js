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
        if(data[2] == 'alias'
        && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 100)) {
          var id = data[4];
          if(!id) {
            return ['{sender}: Please sepcify an alias name!'];
          }
          if(data[3] == 'add' || data[3] == 'edit' || data[3] == 'set') {
            var aliasOutput = data.slice(5);
            if(aliasOutput.length <= 0) {
              return ['{sender}: The output cannot be empty!']
            }
            channel.p.properties.alias[id] = aliasOutput;
            return ['{sender}: Alias added!'];
          } else if(data[3] == 'remove') {
            delete channel.p.properties.alias[id];
            return ['{sender}: Alias removed!'];
          }
        }
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
