var settings = require('../settings.js');
var text = require('../text.js');

var ListCommand = function(base) {
  // inherit prototype
  this.p = base;
}

ListCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'add' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var inputString = data.slice(2).join(' ');
      if(inputString == '' || inputString == ' ') {
        return ['{sender}: List content cannot be empty!'];
      } else {
        this.p.p.properties.listContent.push(text.formatList(this.p.p.properties.output[1], inputString, 0,
        '', '', channel, sender, this.p, data));
        return ['{sender}: Added item!'];
      }
    } else if(data[1] == 'remove' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.listContent.length) {
        return ['{sender}: Please specify a valid list id!'];
      } else {
        this.p.p.properties.listContent.splice(id, 1);
        return ['{sender}: Removed item!'];
      }
    } else if(data[1] == 'edit' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var inputString = data.slice(2).join(' ');
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.listContent.length) {
        return ['{sender}: Please specify a valid list id!'];
      } else {
        if(inputString == '' || inputString == ' ') {
          return ['{sender}: List content cannot be empty!'];
        }
        this.p.p.properties.listContent[id] = text.formatList('{list}', inputString, 0,
        '', '', channel, sender, this.p, data);
        return ['{sender}: Edited item!'];
      }
    } else if(data[1] == 'approve' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.suggestedList.length) {
        return ['{sender}: Please specify a valid id!'];
      }
      this.p.p.properties.listContent.push(this.p.p.properties.suggestedList[id]);
      this.p.p.properties.suggestedList.splice(id, 1);
      return ['{sender}: Approved suggested item!'];
    } else if(data[1] == 'deny' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.suggestedList.length) {
        return ['{sender}: Please specify a valid id!'];
      }
      this.p.p.properties.suggestedList.splice(id, 1);
      return ['{sender}: Denied suggested item!'];
    } else if(data[1] == 'suggest') {
      var inputString = data.slice(1).join(' ');
      if(inputString == '' || inputString == ' ') {
        return ['{sender}: List content cannot be empty!'];
      } else {
        this.p.p.properties.suggestedList.push(text.formatList(this.p.p.properties.output[1], inputString, 0,
        '', '', channel, sender, this.p, data));
        return ['{sender}: Suggested item!'];
      }
    } else if(data[1] == 'list') {
      return ['{sender}: Coming soon!'];
    } else {
      var id = parseInt(data[1]);
      if(isNaN(id)) {
        var random = settings.getRandomInt(0, this.p.p.properties.listContent.length - 1);
        return [text.formatList(this.p.p.properties.output[0], this.p.p.properties.listContent[random], random,
          this.p.p.properties.prefix, this.p.p.properties.suffix, channel, sender, this.p, data)];
      } else {
        return [text.formatList(this.p.p.properties.output[0], this.p.p.properties.listContent[id], id,
          this.p.p.properties.prefix, this.p.p.properties.suffix, channel, sender, this.p, data)];
      }
    }
  }
}

module.exports = {
  ListCommand
}
