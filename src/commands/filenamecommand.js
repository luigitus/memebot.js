var text = require('../text.js');
var sprintf = require("sprintf-js").sprintf;
var settings = require('../settings.js');

var FilenameCommand = function(base) {
  // inherit prototype
  this.p = base;
  this.p.p.setDefaults({namecost : 5}, true);
}

FilenameCommand.prototype = {
  execute: function(data, channel, sender) {
    if(typeof data[2] !== 'undefined') {
      data[2] = text.formatText(data[2]);
    }

    if(data[1] == 'add') {
      if(!sender.payPoints(channel.p.properties._id, this.p.p.properties.namecost)) {
        return [sprintf('{sender}: You do not have %d {currency}', this.p.p.properties.namecost)];
      }
      var newName = data[2];
      if(newName.length <= channel.p.properties.maxfnlen) {
        channel.p.properties.fnList.push({user: sender.p.properties.username,
        name: newName});
        return [sprintf('{sender}: Added the filename!')];
      } else {
        return [sprintf('{sender}: The filename cannot be longer than %s characters!',
        channel.p.properties.maxfnlen)];
      }
    } else if(data[1] == 'get' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      var id = settings.getRandomInt(0, channel.p.properties.fnList.length);
      if(typeof channel.p.properties.fnList[id] === 'undefined') {
        return ['{sender}: There are no more filenames in the list!'];
      }
      channel.p.properties.currentfn = channel.p.properties.fnList[id];
      channel.p.properties.fnList.splice(id, 1);
      return [sprintf('Next filename: %s suggested by %s', channel.p.properties.currentfn['name'],
      channel.p.properties.currentfn['user'])];
    } else if(data[1] == 'current') {
      return [sprintf('{sender}: The current filename is %s suggested by %s', channel.p.properties.currentfn['name'],
      channel.p.properties.currentfn['user'])];
    } else if(data[1] == 'count') {
      return [sprintf('{sender}: The current filename count is: %d', channel.p.properties.fnList.length)];
    } else if(data[1] == 'removename' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      var count = 0;
      for(var i in channel.p.properties.fnList) {
        var n = channel.p.properties.fnList[i];
        if(n['name'] == data[2]) {
          count++;
          i--;
          channel.p.properties.fnList.splice(i, 1);
        }
      }
      return [sprintf('{sender}: Removed %d name(s)', count)];
    } else if(data[1] == 'removeuser' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      var count = 0;
      for(var i in channel.p.properties.fnList) {
        var n = channel.p.properties.fnList[i];
        if(n['user'] == data[2]) {
          count++;
          i--;
          channel.p.properties.fnList.splice(i, 1);
        }
      }
      return [sprintf('{sender}: Removed %d name(s)', count)];
    } else {
      return ['{sender}: Syntax = !name get/current/list/count/removename/removeuser'];
    }
  }
}

module.exports = {
  FilenameCommand
}
