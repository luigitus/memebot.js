var settings = require('../settings.js');
var text = require('../text.js');

var ListCommand = function(base) {
  // inherit prototype
  this.p = base;
}

ListCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'add' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      var inputString = '';
      for(var i = 2; i < data.length; i++) {
        inputString = inputString + data[i] + ' ';
      }
      if(inputString == '' || inputString == ' ') {
        return ['{sender}: List content cannot be empty!'];
      } else {
        this.p.p.properties.listContent.push(text.formatList(this.p.p.properties.output[1], inputString, 0,
        '', ''));
        return ['{sender}: Added item!'];
      }
    } else if(data[1] == 'remove' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.listContent.length) {
        return ['{sender}: Please specify a valid list id!'];
      } else {
        this.p.p.properties.listContent.splice(id, 1);
        return ['{sender}: Removed item!'];
      }
    } else if(data[1] == 'edit' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      var inputString = '';
      for(var i = 3; i < data.length; i++) {
        inputString = inputString + data[i] + ' ';
      }
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.listContent.length) {
        return ['{sender}: Please specify a valid list id!'];
      } else {
        if(inputString == '' || inputString == ' ') {
          return ['{sender}: List content cannot be empty!'];
        }
        this.p.p.properties.listContent[id] = text.formatList('{list}', inputString, 0,
        '', '');
        return ['{sender}: Edited item!'];
      }
    } else if(data[1] == 'approve' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {

    } else if(data[1] == 'deny' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {

    } else if(data[1] == 'suggest') {
    } else {
      var id = parseInt(data[1]);
      if(isNaN(id)) {
        var random = settings.getRandomInt(0, this.p.p.properties.listContent.length - 1);
        return [text.formatList(this.p.p.properties.output[0], this.p.p.properties.listContent[random], random,
          this.p.p.properties.prefix, this.p.p.properties.suffix)];
      } else {
        return [text.formatList(this.p.p.properties.output[0], this.p.p.properties.listContent[id], id,
          this.p.p.properties.prefix, this.p.p.properties.suffix)];
      }
    }
  }
}

module.exports = {
  ListCommand
}
