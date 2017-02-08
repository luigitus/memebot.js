var fs = require('fs');
var settings = require('./settings.js');

module.exports = {
  joinedChannels: {}, // id = key
  commands: {},
  users: {},

  parseCliArgs: function() {
    var args = [];

    process.argv.forEach(function (val, index, array) {
      args.push(val);
    });

    return args;
  },

  getRandomInt: function(min, max) {
    if(typeof min === 'undefined' || typeof max === 'undefined') {
      return Math.floor(Math.random());
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  minit: function() {
    for(var i in settings.gs.paths) {
      if (!fs.existsSync(settings.gs.paths[i])) {
        fs.mkdirSync(settings.gs.paths[i]);
      }
    }
  },

  getChannelByName: function(name) {
    for(var key in module.exports.joinedChannels) {
      if(name == module.exports.joinedChannels[key].p.properties.channel) {
        return module.exports.joinedChannels[key]
      }
    }
  },

  getUserByName: function(name) {
    for(var key in module.exports.users) {
      if(name == module.exports.users[key].p.properties.username) {
        return module.exports.users[key]
      }
    }
  },

  getCommandByName: function(name, channelID) {
    for(var key in module.exports.commands) {
      if(name == module.exports.commands[key].p.properties.name) {
        return module.exports.commands[key]
      }
    }
  }
}
