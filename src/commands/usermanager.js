var settings = require('../settings.js');

var UserManager = function(base) {
  // inherit prototype
  this.p = base;
}

UserManager.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'edit' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      // check if command exists for this channel; only first name is valid in this case
      var user = settings.getUserByID(data[2]);
      if(user == null) {
        user = settings.getUserByName(data[2]);
        if(user == null) {
          return ['{sender}: Could not find that user!'];
        }
      }
      var constantSettings = ['points', 'timeouts', 'joined_t', 'commandpower', '_id'];
      if(constantSettings.indexOf(data[3]) != -1) {
        return ['{sender}: You cannot edit this setting!'];
      }
      var obj = user.p.properties[data[3]];
      if(typeof obj === 'undefined') {
        return ['{sender}: Invalid setting!'];
      }

      if(typeof obj === 'object') {
        var option = data[4];

        // special case for name of commands
        if(data[3] == 'autoGreetMessage') {
          if(option == 'set') {
            var output = data.slice(5).join(' ');
            user.p.properties.autoGreetMessage[channel.p.properties._id] = output;
            return ['{sender}: Autogreet set!'];
          } else {
            return ['{sender}: Syntax autogreet set'];
          }
        } else if(data[3] == 'commandPowerModifier' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 100)) {
          if(!isNaN(data[4])) {
            user.p.properties.commandPowerModifier[channel.p.properties._id] = parseInt(data[4]);
            return ['{sender}: Value edited!'];
          } else {
            return ['{sender}: Please specify a valid number!'];
          }
        }
      } else if(typeof obj === 'number') {
        user.p.properties[data[3]] = parseFloat(data[4]);
        return ['{sender}: Value edited!'];
      } else if(typeof obj === 'boolean') {
        user.p.properties[data[3]] = (data[4] == 'true');
        return ['{sender}: Value edited!'];
      } else {
        user.p.properties[data[3]] = data[4];
        return ['{sender}: Value edited!'];
      }
    } else if(data[1] == 'get' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      // check if command exists for this channel; only first name is valid in this case
      var user = settings.getUserByID(data[2]);
      if(user == null) {
        user = settings.getUserByName(data[2]);
        if(user == null) {
          return ['{sender}: Could not find that user!'];
        }
      }
      var output = JSON.stringify(user.p.properties[data[3]]);
      if(typeof output === 'undefined') {
        return ['{sender}: Could not find this item!'];
      }
      return [output];
    } else {
      return ['{sender}: Syntax - !user edit/get'];
    }
  }
}

module.exports = {
  UserManager
}
