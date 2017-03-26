var text = require('../text.js');
var sprintf = require("sprintf-js").sprintf;
var settings = require('../settings.js');

var FilenameCommand = function(base) {
  // inherit prototype
  this.p = base;
  this.p.p.setDefaults({namecost : 5,
    useChannelList: true,
    fnList: [],
    maxfnlen: 8,
    maxNameInList: -1,
    currentfn: {},
    removeNameAfterPick: true
  }, false);
}

FilenameCommand.prototype = {
  execute: function(data, channel, sender) {
    var fnList = this.p.p.properties.fnList;
    var maxfnlen = this.p.p.properties.maxfnlen;
    var currentfn = this.p.p.properties.currentfn;
    if(this.p.p.properties.useChannelList) {
      fnList = channel.p.properties.fnList;
      maxfnlen = channel.p.properties.maxfnlen;
      currentfn = channel.p.properties.currentfn;
    }

    if(typeof data[2] !== 'undefined') {
      data[2] = text.formatText(data[2]);
    }

    if(data[1] == 'add') {
      if(!sender.payPoints(channel.p.properties._id, this.p.p.properties.namecost)) {
        return [sprintf('{sender}: You do not have %d {currency}', this.p.p.properties.namecost)];
      }
      var count = 0;
      for(var i in fnList) {
        var n = fnList[i];
        if(n['user'] == sender.p.properties.username) {
          count++;
          i--;
        }
      }
      if(count > this.p.p.properties.maxNameInList && this.p.p.properties.maxNameInList >= 0) {
        return ['{sender}: You cannot add any more items!'];
      }
      var newName = data[2];
      if(newName.length <= maxfnlen && maxfnlen >= 0) {
        if(this.p.p.properties.formatData) {
          fnList.push({user: sender.p.properties.username,
          name: text.formatList(this.p.p.properties.output[0],
            newName, 0, this.p.p.properties.prefix, this.p.p.properties.suffix,
            channel, sender, this.p, data)});
        } else {
          fnList.push({user: sender.p.properties.username,
          name: newName});
        }
        return [sprintf('{sender}: Added the item!')];
      } else {
        return [sprintf('{sender}: The item cannot be longer than %s characters!',
        maxfnlen)];
      }
    } else if(data[1] == 'get' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      var id = settings.getRandomInt(0, fnList.length);
      if(typeof fnList[id] === 'undefined') {
        return ['{sender}: There are no more item in the list!'];
      }
      currentfn = fnList[id];
      if(this.p.p.properties.removeNameAfterPick) {
        fnList.splice(id, 1);
      }
      return [sprintf('Next filename: %s suggested by %s', currentfn['name'],
      currentfn['user'])];
    } else if(data[1] == 'clear' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50) ) {
      fnList.splice(0, fnList.length);
      return ['{sender}: Name list cleared!'];
    } else if(data[1] == 'current') {
      return [sprintf('{sender}: The current filename is %s suggested by %s', currentfn['name'],
      currentfn['user'])];
    } else if(data[1] == 'count') {
      return [sprintf('{sender}: The current filename count is: %d', fnList.length)];
    } else if(data[1] == 'removename' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      var count = 0;
      for(var i in fnList) {
        var n = fnList[i];
        if(n['name'] == data[2]) {
          count++;
          i--;
          fnList.splice(i, 1);
        }
      }
      return [sprintf('{sender}: Removed %d item(s)', count)];
    } else if(data[1] == 'removeuser' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      var count = 0;
      for(var i in fnList) {
        var n = fnList[i];
        if(n['user'] == data[2]) {
          count++;
          i--;
          fnList.splice(i, 1);
        }
      }
      return [sprintf('{sender}: Removed %d item(s)', count)];
    } else {
      return ['{sender}: Syntax = add/get/current/list/count/removename/removeuser'];
    }
  }
}

module.exports = {
  FilenameCommand
}
