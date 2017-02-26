var log = require('./mlog.js');
var fs = require('fs');
var twitchapi = require('./twitchapi.js');
var settings = require('./settings.js');
var user = require('./user.js');

// this is a collection of functions that will help import old date to a new database
// all import commands take a json converted from a bson
// the database that is to be imported has to be created by memebotj (the old version of memebot)
// the callbacks are used for the http request that will be needed to check user ids
module.exports = {
  checkImport: function() {
    // do convertion of old database files
    if(settings.gs.doImport) {
      if(!fs.existsSync('./config/toconvert')) {
        fs.mkdirSync('./config/toconvert');
      }
      if(!fs.existsSync('./config/converted')) {
        fs.mkdirSync('./config/converted');
      }
      var importFiles = fs.readdirSync('./config/toconvert');
      // do the bson convert job
      for(var i in importFiles) {
        this.bsonToJson('./config/toconvert/' + importFiles[i], './config/converted/' + importFiles[i].replace('.bson', '.json'));
      }
    }
    // do import of old database files
    if(settings.gs.doConvert) {
      // import files in converted directory
      importFiles = fs.readdirSync('./config/converted');
      for(var i in importFiles) {
        if(importFiles[i].search('_commands.json') != -1) {
          if(settings.gs.doCOnvertCommands) {
            this.importCommandFromLegacyDB('./config/converted/' + importFiles[i]);
          }
        } else if(importFiles[i].search('_users.json') != -1) {
          if(settings.gs.doConvertUsers) {
            this.importUserFromLegacyDB('./config/converted/' + importFiles[i]);
          }
        } else {
          if(settings.gs.doConvertChannels) {
            // assume it's channel file
            this.importChannelFromLegacyDB('./config/converted/' + importFiles[i]);
          }
        }
      }
    }
  },

  importCommandCallback: function(username, data, commandData) {
    if(typeof data.users[0] === 'undefined') {
      log.log('Undefined user information for username: ' + username);
      return;
    }
    var displayname = data.users[0].display_name;
    var id = data.users[0]._id;

    if(username == displayname) {
      var cmd = settings.getCommandByName(commandData._id);
      var cs = {name: [], helptext: [], types: [], output: [], ownerChannelID: id, channelID: [id]};
      var ch = settings.getChannelByName(commandData.channel);
      if(ch == null) {
        log.log('Cannot find channel ' + commandData.channel + ' for user ' + editUser);
        return;
      }

      var typeisDefault = false;
      var outputEmpty = false;
      for(var key in commandData) {
        // parse every individual important key and pass it on to a channel
        if(key == '_id') {
          cs.name[0] = commandData[key];
        } else if(key == 'cooldown') {
          cs.cooldownLength = commandData[key];
        } else if(key == 'helptext') {
          cs.helptext[0] = commandData[key];
        } else if(key == 'cmdtype') {
          if(commandData[key] == 'timer') {
            cs.isTimer = true;
          }
          if(commandData[key] != 'default' && commandData[key] != 'list' && commandData[key] != 'counter') {
            commandData[key] = 'default';
          }
          if(commandData[key] == 'default') {
            typeisDefault = true;
          }
          cs.types[0] = commandData[key];
        } else if(key == 'output') {
          if(commandData[key] == '') {
            outputEmpty = true;
          }
          cs.output[0] = commandData[key];
        } else if(key == 'qsuffix') {
          cs.suffix = commandData[key];
        } else if(key == 'qprefix') {
          cs.prefix = commandData[key];
        } else if(key == 'costf') {
          cs.cos = commandData[key];
        } else if(key == 'counter') {
          cs.counter = commandData[key];
        } else if(key == 'listcontent') {
          cs.listContent = commandData[key];
        } else if(key == 'texttrigger') {
          cs.textTrigger =  commandData[key];
        } else if(key == 'execcounter') {
          cs.timesExecuted = commandData[key];
        } else if(key == 'suggestedList') {
          cs.suggestedList = commandData[key];
        } else if(key == 'executeChance') {
          cs.chance = commandData[key];
        } else if(key == 'script') {
          cs.output[2] = commandData[key];
        } else if(key == 'param') {
          cs.parametres = commandData[key];
        }
      }

      // make sure lists work!
      if(cs.types[0] == 'list') {
        cs.output[0] = '{list}';
      }

      if(outputEmpty && typeisDefault) {
        log.log('Skipping import of command ' + cs.name[0] + ' because of empty output!');
        return;
      }

      if(cmd == null) {
        var newID = settings.getRandomInt(1000);
        while(newID in settings.commands) {
          newID = settings.getRandomInt(1000);
        }
        cs._id = newID;
        settings.loadCommand(newID, cs);
      } else {
        cmd.p.setDefaults(cs, true);
      }
    }
  },

  importCommandFromLegacyDB: function(fileToImport) {
    var contents = JSON.parse(fs.readFileSync(fileToImport, 'utf8'));
    var i = 0;
    var obj = this;
    var interval = setInterval(function() {
        if(i > contents.length) {
          clearInterval(interval);
          return;
        } else {
          if(typeof contents[i] === 'undefined') {
            log.log('Contents are undefined!');
            clearInterval(interval);
            return;
          }
          contents[i].channel = fileToImport.replace('_commands.json', '');
          contents[i].channel = contents[i].channel.replace('./config/converted/', '');
          twitchapi.TwitchAPI.getUserInformationFromName(contents[i].channel.replace('#', ''),
          contents[i], obj.importCommandCallback);
        }
        i++;
    }, 1000);
  },

  importUserCallback: function(username, data, userData) {
    if(typeof data.users[0] === 'undefined') {
      log.log('Undefined user information for username: ' + username);
      return;
    }
    var displayname = data.users[0].display_name;
    var id = data.users[0]._id;

    if(userData._id == displayname) {
      // check if channel already existsSync
      var editUser = settings.getUserByID(id);
      var cs = {_id : id};
      var ch = settings.getChannelByName(userData.channel);
      if(ch == null) {
        log.log('Cannot find channel ' + userData.channel + ' for user ' + editUser);
        return;
      }
      var channelID = ch.p.properties._id;
      if(editUser == null) {
        editUser = new user.User(id, {});
      }
      // this is bad; deal with it; not important
      var interval = setInterval(function() {
        if(!editUser.p.isLoaded) {
          return;
        }
        clearInterval(interval);
        for(var key in userData) {
          // parse every individual important key and pass it on to a channel
          if(key == '_id') {
            cs.username = userData[key];
          } else if(key == 'pointsf') {
            editUser.p.properties.points[channelID] = Math.floor(userData[key]);
          } else if(key == 'autogreet') {
            editUser.p.properties.autoGreetMessage[channelID] = userData[key];
          }
        }
        editUser.p.save();
      }, 20);
    }
  },

  importUserFromLegacyDB: function(fileToImport) {
    var contents = JSON.parse(fs.readFileSync(fileToImport, 'utf8'));
    var i = 0;
    var obj = this;
    var interval = setInterval(function() {
        if(i > contents.length) {
          clearInterval(interval);
          return;
        } else {
          if(typeof contents[i] === 'undefined') {
            log.log('Contents are undefined!');
            clearInterval(interval);
            return;
          }
          contents[i].channel = fileToImport.replace('_users.json', '');
          contents[i].channel = contents[i].channel.replace('./config/converted/', '');
          twitchapi.TwitchAPI.getUserInformationFromName(contents[i]._id.replace(/#/g, ''),
          contents[i], obj.importUserCallback);
        }
        i++;
    }, 1000);
  },

  importChannelCallback: function(username, data, channelData) {
    if(typeof data.users[0] === 'undefined') {
      log.log('Undefined user information for username: ' + username);
      return;
    }
    var displayname = data.users[0].display_name;
    var id = data.users[0]._id;

    if(channelData._id == ('#' + displayname)) {
      // check if channel already existsSync
      var ch = settings.getChannelByID(id);
      var cs = {_id : id};
      for(var key in channelData) {
        // parse every individual important key and pass it on to a channel
        if(key == '_id') {
          cs.channel = channelData[key];
        } else if(key == 'maxfilenamelen') {
          cs.maxfnlen = channelData[key]
        } else if(key == 'fileanmelist') {
          cs.fnList = [];
          for(var i in channelData[key]) {
            cs.fnList.push({user : channelData[key][i].split('#')[1], name : channelData[key][i].split('#')[0]});
          }
        } else if(key == 'silent') {
          cs.silent = channelData[key];
        } else if(key == 'pointswhenoffline') {
          cs.offlinepoints = channelData[key];
        } else if(key == 'allowgreetmessage') {
          cs.greet = channelData[key];
        } else if(key == 'curremote') {
          cs.currency = channelData[key];
        }
      }
      cs.shouldJoin = true;
      if(ch == null) {
        settings.joinChannel(id, cs);
      } else {
        ch.p.setDefaults(cs, true);
      }
    }
  },

  importChannelFromLegacyDB: function(fileToImport) {
    var contents = JSON.parse(fs.readFileSync(fileToImport, 'utf8'));
    var i = 0;
    var obj = this;
    var interval = setInterval(function() {
      if(i > contents.length) {
        clearInterval(interval);
        return;
      } else {
        if(typeof contents[i] === 'undefined') {
          log.log('Contents are undefined!');
          clearInterval(interval);
          return;
        }
        twitchapi.TwitchAPI.getUserInformationFromName(contents[i]._id.replace('#', ''),
        contents[i], obj.importChannelCallback);
      }
      i++;
    }, 1000);
  },

  bsonToJson: function(input, output) {
    var fs = require('fs');
    var BsonJsonTransform = require('bson-json-transform');

    fs
    .createReadStream(input)
    .pipe(BsonJsonTransform({ preserveInt64: 'string', arrayOfBsons: true}))
    .pipe(fs.createWriteStream(output))
    .on('end', function (data) {
        log.log('Done exporting bson to json!');
    });
  }
}
