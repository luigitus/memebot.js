var settings = require('../settings.js');
var log = require('../mlog.js');

var CommandManager = function(base) {
  // inherit prototype
  this.p = base;
}

CommandManager.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'lc') {
      var list = 0;
      if(typeof data[2] === 'number') {
        list = data[2];
      }
      var retList = '';
      var i = list * 10;
      var counter = 0;
      for(var cmdID in settings.commands) {
        var cmd = settings.commands[cmdID];

        if(i >= list * 10 + 10) {
          break;
        } else if(i < counter) {
          continue;
        }

        if(cmd.p.properties.channelID.indexOf(channel.p.properties._id) != -1
        || cmd.p.properties.channelID.indexOf('#all#') != -1) {
          retList = retList + cmd.p.properties.name + ' >> ';
          i++;
        }
        counter++;
      }

      return [retList];
    } else if(data[1] == 'list') {
      return ['{sender}: ' + channel.p.properties.channel + '\'s comamnds can be found here: ' +
      settings.gs.url + '/commandlist?page=0&channelid=' + channel.p.properties._id];
    } else if(data[1] == 'add' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      var newID = settings.getRandomInt(1000);
      while(newID in settings.commands) {
        newID = settings.getRandomInt(1000);
      }
      var output = '';
      for(var i = 3; i < data.length; i++) {
        output = output + data[i] + ' ';
      }

      if(output === '' || output === ' ') {
        return ['{sender}: Please specify an output value!'];
      }

      settings.loadCommand(newID, {name: [data[2]], ownerChannelID: channel.p.properties._id,
      channelID: [channel.p.properties._id], output: [output]});

      return ['{sender}: Added command'];
    } else if(data[1] == 'remove' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      var exists = false;
      // check if command exists for this channel; only first name is valid in this case
      for(var i in settings.commands) {
        var cmd = settings.commands[i];
        if(cmd.p.properties.name[0] == data[2] && cmd.p.properties.ownerChannelID == channel.p.properties._id) {
          log.log(sender.p.properties.username + '(' + sender.p.properties._id + ')' +
          ' removed command ' + cmd.p.properties.name + '(' +
          cmd.p.properties._id + ') from channel ' + channel.p.properties.channel + '(' +
          cmd.p.properties._id + ')');
          settings.commands[i].p.remove();
          delete settings.commands[i];
        }
      }

      return ['{sender}: Removed command(s)'];
    } else if(data[1] == 'edit' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      // check if command exists for this channel; only first name is valid in this case
      var cmd = settings.getCommandByName(data[2], channel.p.properties._id);
      var constantSettings = ['channelID', 'timesExecuted', 'ownerChannelID', 'channelID', '_id',
      'pointsperupdate'];
      if(constantSettings.indexOf(data[3]) != -1) {
        return ['{sender}: You cannot edit this setting!'];
      }

      if(cmd == null) {
        return ['{sender}: Could not find command!'];
      }
      var obj = cmd.p.properties[data[3]];
      if(typeof obj === 'undefined') {
        return ['{sender}: Invalid setting!'];
      }

      if(typeof obj === 'object') {
        var option = data[4];

        // special case for name of commands
        if(data[3] == 'name') {
          if(option == 'add') {
            cmd.p.properties.name.push(data[5]);
            return ['{sender}: Name added!'];
          } else if(option == 'remove') {
            if(cmd.p.properties.name.length == 1) {
              return ['{sender}: You cannot remove the last name!'];
            } else {
              var id = parseInt(data[5]);
              if(isNaN(id)) {
                delete cmd.p.properties.name.pop();
                return ['{sender}: Name removed!'];
              } else {
                delete cmd.p.properties.name[id];
                return ['{sender}: Name removed!'];
              }
            }
          } else if(option == 'edit') {
            var id = parseInt(data[5]);
            if(typeof id !== 'number') {
              return ['{sender}: The ID must be a number!'];
            } else if(typeof data[6] === 'string') {
              cmd.p.properties.name[id] = data[6];
              return ['{sender}: Name edited!'];
            }

            return ['{sender}: Could not edit name!'];
          } else {
            return ['{sender}: Please specify which option (add/remove/edit)'];
          }
        }
        // special case for output
        if(data[3] == 'output') {
          if(option == 'add') {
            var output = '';
            for(var i = 5; i < data.length; i++) {
              output = output + data[i] + ' ';
            }
            if(output === '' || output === ' ') {
              return ['{sender}: Please specify an output value!'];
            }
            cmd.p.properties.output.push(output);
            return ['{sender}: Output added!'];
          } else if(option == 'remove') {
            if(cmd.p.properties.output.length == 1) {
              return ['{sender}: You cannot remove the last output!'];
            } else {
              var id = parseInt(data[5]);
              if(isNaN(id)) {
                delete cmd.p.properties.output.pop();
                return ['{sender}: Output removed!'];
              } else {
                delete cmd.p.properties.output[id];
                return ['{sender}: Output removed!'];
              }
            }
          } else if(option == 'edit') {
            var id = parseInt(data[5]);
            if(typeof id !== 'number') {
              return ['{sender}: The ID must be a number!'];
            } else if(typeof data[6] === 'string') {
              var output = '';
              for(var i = 6; i < data.length; i++) {
                output = output + data[i] + ' ';
              }
              if(output === '' || output === ' ') {
                return ['{sender}: Please specify an output value!'];
              }
              cmd.p.properties.output[id] = output;
              return ['{sender}: Output edited!'];
            }

            return ['{sender}: Could not edit output!'];
          } else {
            var output = '';
            for(var i = 5; i < data.length; i++) {
              output = output + data[i] + ' ';
            }
            if(output === '' || output === ' ') {
              return ['{sender}: Please specify an output value!'];
            }

            cmd.p.properties.output[0] = output;
            return ['{sender}: Output edited'];
          }
        }

        // special case for helptext
        if(data[3] == 'helptext') {
          if(option == 'add') {
            var output = '';
            for(var i = 5; i < data.length; i++) {
              output = output + data[i] + ' ';
            }
            if(output === '' || output === ' ') {
              return ['{sender}: Please specify an output value!'];
            }
            cmd.p.properties.helptext.push(output);
            return ['{sender}: Output added!'];
          } else if(option == 'remove') {
            if(cmd.p.properties.helptext.length == 1) {
              return ['{sender}: You cannot remove the last output!'];
            } else {
              var id = parseInt(data[5]);
              if(isNaN(id)) {
                delete cmd.p.properties.helptext.pop();
                return ['{sender}: Output removed!'];
              } else {
                delete cmd.p.properties.helptext[id];
                return ['{sender}: Output removed!'];
              }
            }
          } else if(option == 'edit') {
            var id = parseInt(data[5]);
            if(typeof id !== 'number') {
              return ['{sender}: The ID must be a number!'];
            } else if(typeof data[6] === 'string') {
              var output = '';
              for(var i = 6; i < data.length; i++) {
                output = output + data[i] + ' ';
              }
              if(output === '' || output === ' ') {
                return ['{sender}: Please specify an output value!'];
              }
              cmd.p.properties.helptext[id] = output;
              return ['{sender}: Output edited!'];
            }

            return ['{sender}: Could not edit output!'];
          } else {
            return ['{sender}: Please specify which option (add/remove/edit)'];
          }
        }

        // special case for scripts
        if(data[3] == 'types') {
          var cr = require('../commandreference.js');
          if(option == 'add') {
            if(!(data[5] in cr)) {
              return ['{sender}: This command type does not exist!'];
            } else {
              cmd.p.properties.types.push(data[5]);
              cmd.scripts.push(new cr[data[5]](cmd));
              return ['{sender}: Type added!'];
            }
          } else if(option == 'remove') {
            if(cmd.p.properties.types.length == 1) {
              return ['{sender}: You cannot remove the last type!'];
            } else {
              var id = parseInt(data[5]);
              if(isNaN(id)) {
                delete cmd.p.properties.types.pop();
                delete cmd.scripts.pop();
                return ['{sender}: Type removed!'];
              } else {
                delete cmd.p.properties.types[id];
                delete cmd.scripts[id];
                return ['{sender}: Type removed!'];
              }
            }
          } else {
            return ['{sender}: Please specify which option (add/remove)'];
          }
        }

      } else if(typeof obj === 'number') {
        cmd.p.properties[data[3]] = parseFloat(data[4]);

        return ['{sender}: Value edited!'];
      } else if(typeof obj === 'boolean') {
        cmd.p.properties[data[3]] = (data[4] == 'true');
        return ['{sender}: Value edited!'];
      } else {
        cmd.p.properties[data[3]] = data[4];
        return ['{sender}: Value edited!'];
      }
    } else if(data[1] == 'get' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      // check if command exists for this channel; only first name is valid in this case
      var cmd = settings.getCommandByName(data[2], channel.p.properties._id);
      if(cmd == null) {
        return ['{sender}: Could not find command!'];
      }
      var output = JSON.stringify(cmd.p.properties[data[3]]);
      if(typeof output === 'undefined') {
        return ['{sender}: Could not find this item!'];
      }
      return [output];
    } else {
      return ['{sender}: Syntax - !command list/edit/add/remove/get'];
    }
  }
}

module.exports = {
  CommandManager
}
