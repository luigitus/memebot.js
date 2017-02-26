var fs = require('fs');
var log = require("./mlog.js");
var Datastore = require('nedb');

module.exports = {
  gs: {},
  build: {
    appName: 'memebot.js',
    version: '1.0.0',
    dev: 'Lukas Myers',
    git: 'https://github.com/unlink2/memebot.js/'
  },

  joinedChannels: {}, // id = key
  commands: {},
  users: {},
  db: {},
  commandPower: {
    user: 0,
    mod: 25,
    broadcaster: 50,
    moderator: 75,
    admin: 100
  },

  readSettings: function(file) {
    var contents;
    try {
      contents = fs.readFileSync(file, 'utf8');
    } catch(err) {
      contents = fs.readFileSync('../' + file, 'utf8');
      log.log(err);
    }

    this.gs = JSON.parse(contents);
  },

  readIDs: function() {
    var util = this;
    /*this.users = fs.readdirSync(this.gs.paths.users);
    this.ch = fs.readdirSync(this.gs.paths.channels);
    this.commands = fs.readdirSync(this.gs.paths.commands);*/
    var obj = this;

    this.db['commands'].find({_id : {$gt: 1000}}, function(err, doc) {
      if(err != null) {
        log.log(err);
      }
      for(var command in doc) {
        obj.loadCommand(doc[command]._id);
      }
    });

    // load default commands if not already loaded
    var dc = require('./defaultcommands.js');
    for(var c in dc) {
      if(module.exports.getCommandByID(dc[c]._id) == null) {
        module.exports.loadCommand(dc[c]._id, dc[c]);
      }
    }

    this.db['channels'].find({}, function(err, doc) {
      if(err != null) {
        log.log(err);
      }
      if(doc.length == 0) {
        module.exports.joinChannel(module.exports.gs.defaultchannelid);
      }

      for(var channel in doc) {
        module.exports.joinChannel(doc[channel]._id);
      }
    });
  },

  // utility functions

  // note to self; require may be needed at bottom
  minit: function() {
    for(var i in this.gs.paths) {
      var newdb = new Datastore({filename: this.gs.paths[i], autoload: true,
        onload: function(err) {
          if(err != null) {
            log.log(err);
          }
        }
      });
      newdb.persistence.setAutocompactionInterval(1800 * 1000)
      this.db[i] = newdb;
    }

    // check for backup folder
    if(!fs.existsSync('./config/backups')) {
      fs.mkdirSync('./config/backups');
    }
  },

  parseCliArgs: function() {
    var args = [];

    process.argv.forEach(function (val, index, array) {
      args.push(val);
    });

    return args;
  },

  getRandomInt: function(min, max) {
    if(typeof min === 'undefined') {
      min = 0;
    } else if(typeof max === 'undefined') {
      max = Number.MAX_SAFE_INTEGER
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getChannelByName: function(name) {
    for(var key in module.exports.joinedChannels) {

      if(name == module.exports.joinedChannels[key].p.properties.channel) {
        return module.exports.joinedChannels[key]
      }
    }

    return null;
  },

  getChannelByID: function(id) {
    for(var key in module.exports.joinedChannels) {
      if(id == module.exports.joinedChannels[key].p.properties._id) {
        return module.exports.joinedChannels[key]
      }
    }

    return null;
  },

  getUserByName: function(name) {
    for(var key in module.exports.users) {
      if(name == module.exports.users[key].p.properties.username) {
        return module.exports.users[key]
      }
    }
    return null;
  },

  getUserByID: function(id) {
    for(var key in module.exports.users) {
      if(id == module.exports.users[key].p.properties._id) {
        return module.exports.users[key]
      }
    }
    return null;
  },

  getCommandByName: function(name, channelID) {
    for(var key in module.exports.commands) {
      if(module.exports.commands[key].p.properties.name.indexOf(name) != -1) {
        if(typeof channelID === 'undefined'
        || module.exports.commands[key].p.properties.ownerChannelID == channelID) {
          return module.exports.commands[key]
        }
      }
    }

    return null;
  },

  getCommandByID: function(id, channelID) {
    for(var key in module.exports.commands) {
      if(module.exports.commands[key].p.properties._id == id) {
        if(typeof channelID === 'undefined'
        || module.exports.commands[key].p.properties.ownerChannelID == channelID) {
          return module.exports.commands[key]
        }
      }
    }

    return null;
  },

  checkCommandPower: function(cp, neededcp) {
    if(typeof cp == 'undefined') {
      cp = 0;
    }
    return cp >= neededcp;
  },

  joinChannel: function(channelID, settings) {
    var channel = require('./channel.js');
    var ch = new channel.Channel(channelID, settings);
    module.exports.joinedChannels[channelID] = ch;

    return ch;
  },

  loadCommand: function(commandID, settings) {
    var command = require('./command.js');
    var cmd = new command.Command(commandID, settings);
    module.exports.commands[commandID] = cmd;

    return cmd;
  },

  loadUser: function(userID, settings) {
    var user = require('./user.js');
    var usr = new user.User(userID, settings);
    module.exports.users[userID] = usr;

    return usr;
  },

  saveAll: function() {
    for(var key in module.exports.commands) {
      module.exports.commands[key].p.save();
    }

    for(var key in module.exports.joinedChannels) {
      module.exports.joinedChannels[key].p.save();
    }

    for(var key in module.exports.users) {
      module.exports.users[key].p.save();
    }
  }
}
