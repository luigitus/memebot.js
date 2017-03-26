var settings = require('../settings.js');
var text = require('../text.js');
var log = require('../mlog.js');
var fuzzy = require('fuzzy');

var ListCommand = function(base) {
  // inherit prototype
  this.p = base;
  this.p.p.setDefaults({editcommandpower: 25, allowPicks: true});

  // update content to new format
  for(var i in this.p.p.properties.listContent) {
    if(typeof this.p.p.properties.listContent[i] === 'string') {
      log.log(this.p.p.properties._id + ' : Updated ' + this.p.p.properties.listContent[i] + ' to new object system!');
      this.p.p.properties.listContent[i] = {text: this.p.p.properties.listContent[i]};
    }
    if(!this.p.p.properties.listContent[i].metaData) {
      this.p.p.properties.listContent[i].metaData = {};
    }
  }
  for(var i in this.p.p.properties.suggestedList) {
    if(typeof this.p.p.properties.suggestedList[i] === 'string') {
      log.log(this.p.p.properties._id + ' Updated ' + this.p.p.properties.suggestedList[i] + ' to new object system!');
      this.p.p.properties.suggestedList[i] = {text: this.p.p.properties.suggestedList[i]};
    }
    if(!this.p.p.properties.suggestedList[i].metaData) {
      this.p.p.properties.suggestedList[i].metaData = {};
    }
  }
}

ListCommand.prototype = {
  execute: function(data, channel, sender) {
    var metaData = {game: channel.p.properties.game, timestamp: Date.now() / 1000 | 0,
      addedByID: sender.p.properties._id,
      addedByName: sender.p.properties.username}

    if(data[1] == 'add' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), this.p.p.properties.editcommandpower) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var inputString = data.slice(2).join(' ');
      if(inputString == '' || inputString == ' ') {
        return ['{sender}: List content cannot be empty!'];
      } else {
        if(this.p.p.properties.formatData) {
          this.p.p.properties.listContent.push({text: text.formatList(this.p.p.properties.output[1], inputString, 0,
            '', '', channel, sender, this.p, data), metaData});
        } else {
          this.p.p.properties.listContent.push({text: inputString, metaData});
        }
        return ['{sender}: Added item!'];
      }
    } else if(data[1] == 'remove' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), this.p.p.properties.editcommandpower) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.listContent.length) {
        return ['{sender}: Please specify a valid list id!'];
      } else {
        this.p.p.properties.listContent.splice(id, 1);
        return ['{sender}: Removed item!'];
      }
    } else if(data[1] == 'edit' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), this.p.p.properties.editcommandpower) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var inputString = data.slice(3).join(' ');
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.listContent.length) {
        return ['{sender}: Please specify a valid list id!'];
      } else {
        if(inputString == '' || inputString == ' ') {
          return ['{sender}: List content cannot be empty!'];
        }
        if(this.p.p.properties.formatData) {
          this.p.p.properties.listContent[id].text = text.formatList('{list}', inputString, 0,
          '', '', channel, sender, this.p, data);
        } else {
          this.p.p.properties.listContent[id].text = inputString;
        }
        return ['{sender}: Edited item!'];
      }
    } else if(data[1] == 'approve' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), this.p.p.properties.editcommandpower) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.suggestedList.length) {
        return ['{sender}: Please specify a valid id!'];
      }
      this.p.p.properties.listContent.push(this.p.p.properties.suggestedList[id]);
      this.p.p.properties.suggestedList.splice(id, 1);
      return ['{sender}: Approved suggested item!'];
    } else if(data[1] == 'deny' &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), this.p.p.properties.editcommandpower) &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      var id = parseInt(data[2]);
      if(isNaN(id) || id >= this.p.p.properties.suggestedList.length) {
        return ['{sender}: Please specify a valid id!'];
      }
      this.p.p.properties.suggestedList.splice(id, 1);
      return ['{sender}: Denied suggested item!'];
    } else if(data[1] == 'suggest') {
      var inputString = data.slice(2).join(' ');
      if(inputString == '' || inputString == ' ') {
        return ['{sender}: List content cannot be empty!'];
      } else {
        this.p.p.properties.suggestedList.push({text: text.formatList(this.p.p.properties.output[1], inputString, 0,
        '', '', channel, sender, this.p, data), metaData});
        return ['{sender}: Suggested item!'];
      }
    } else if(data[1] == 'list') {
      return ['{sender}: A list of all items can be found here: ' +
      settings.gs.url + '/commandview?commandid=' + this.p.p.properties._id];
    } else if(data[1] == 'count') {
      return ['{sender}: List Count = ' + this.p.p.properties.listContent.length + ' Suggested List Count = ' +
      this.p.p.properties.suggestedList.length];
    } else {
      var id = parseInt(data[1]);
      if(typeof data[1] === 'undefined' || !this.p.p.properties.allowPicks) {
        var random = settings.getRandomInt(0, this.p.p.properties.listContent.length - 1);
        if(!this.p.p.properties.listContent[random]) {
          return ['undefined'];
        }
        return [text.formatList(this.p.p.properties.output[0], this.p.p.properties.listContent[random].text, random,
          this.p.p.properties.prefix, this.p.p.properties.suffix, channel, sender, this.p, data)];
      } else if(isNaN(id)) {
        var searchString = data.slice(1).join(' ');
        var foundContet = [];
        for(var i in this.p.p.properties.listContent) {
          try {
            if(this.p.p.properties.listContent[i].text.toLowerCase().search(searchString.toLowerCase()) != -1) {
              foundContet.push(this.p.p.properties.listContent[i]);
            }
          } catch(err) {
            log.log(err);
          }
        }

        var random = settings.getRandomInt(0, foundContet.length - 1);
        if(!foundContet[random]) {
          return ['undefined'];
        }
        return [text.formatList(this.p.p.properties.output[0], foundContet[random].text, random,
          this.p.p.properties.prefix, this.p.p.properties.suffix, channel, sender, this.p, data)];

      } else {
        if(!this.p.p.properties.listContent[id]) {
          return ['undefined'];
        }
        return [text.formatList(this.p.p.properties.output[0], this.p.p.properties.listContent[id].text, id,
          this.p.p.properties.prefix, this.p.p.properties.suffix, channel, sender, this.p, data)];
      }
    }
  }
}

module.exports = {
  ListCommand
}
