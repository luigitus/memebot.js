var fs = require('fs');
var log = require("./mlog.js");
var Datastore = require('nedb');
var npid = require('npid');
var math = require('mathjs');

module.exports = {
  gs: {},
  build: {
    appName: 'memebot',
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
  dberrors: 0,

  quit: function(code) {
    log.log('Exiting with code: ' + code);
    process.exit();
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

    this.db['commands'].find({}, function(err, doc) {
      if(err) {
        log.log(err);
      }
      for(var command in doc) {
        if(parseInt(doc[command]._id) > 1000 || isNaN(doc[command]._id)) {
          obj.loadCommand(doc[command]._id);
        }
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
    var obj = this;
    // write pid file
    try {
      var pid = npid.create('./config/process.pid');
      pid.removeOnExit();
    } catch (err) {
      log.log(err);
      if(!this.gs.debug) {
        obj.quit(1);
      }
    }

    for(var i in this.gs.paths) {
      var newdb = new Datastore({filename: this.gs.paths[i], timestampData: true, autoload: true, corruptAlertThreshold: 0,
        onload: function(err) {
          if(err != null) {
            log.log(err);
            obj.quit(1);
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

  generateUUID: function() {
    var uuid = require('node-uuid');
    return uuid.v1();
  },

  getRandomToken: function() {
    return require('crypto').randomBytes(64).toString('hex');
  },

  evalToken: function(token) {
    return false;
  },

  evalExpression: function(toEval) {
    var evaled = '';
    var retstatus = true;
    try {
      evaled = math.eval(toEval);
    } catch(err) {
      evaled = err;
      retstatus = false;
    }
    if(isNaN(evaled) || typeof evaled !== 'number') {
      retstatus = false;
    }

    return {e: evaled, status: retstatus};
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
    if(typeof name === 'undefined') {return null;}
    name = name.toLowerCase();
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
    console.log(name);
    for(var key in module.exports.commands) {
      if(typeof module.exports.commands[key].p.properties.name === 'undefined') {
        return null
      }
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
    log.log('Joined channel ' + channelID);
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

  setAdminPower(senderObject, channelid) {
    // global mods/admins
    for(var i in this.gs.moderators) {
      if(this.gs.moderators[i] == senderObject.p.properties.username) {
        senderObject.p.properties.commandpower[channelid] = this.commandPower.moderator;
      }
    }
    for(var i in this.gs.admins) {
      if(this.gs.admins[i] == senderObject.p.properties.username) {
        senderObject.p.properties.commandpower[channelid] = this.commandPower.admin;
      }
    }
  },

  isModerator(id) {
    for(var i in this.gs.moderators) {
      if(this.gs.moderators[i] == id) {
        return true;
      }
    }
    return false;
  },

  isAdmin(id) {
    for(var i in this.gs.admins) {
      if(this.gs.admins[i] == id) {
        return true;
      }
    }

    return false;
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
