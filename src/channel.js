var settings = require('./settings.js');
var fs = require('fs');
var base = require('./baseobj.js');
var log = require('./mlog.js');
var automod = require('./messagefilters/automodfilter.js');

var Channel = function(id, cs) {
  this.p = new base.BaseObject(id, 'channels', this);
  this.connected = false;
  this.connection = null;
  this.cs = cs;
  this.commandQueue = [];
  //Object.setPrototypeOf(this, base.BaseObject);
  // create defaults list
  this.defaults = {
    shouldJoin: true,
    channel: settings.gs.defaultchannel,
    greet: false,
    greetMessage: 'Hello I\'m {appname} version {version} the dankest irc bot ever RitzMitz',
    maxfnlen: 8,
    fnList: [],
    currentfn: {},
    pointsperupdate: 1,
    silent: false,
    offlinepoints: false,
    currency: 'points',
    _id: id,
    title: '',
    game: '',
    gameid: '0',
    uptime_t: 0,
    useDefaultLogin: true,
    botoauth: '',
    botName: '',
    isLive: false,
    automod: true,
    discordguildid: '83814260886474752'
  }

  var obj = this;
  this.p.load(this.afterLoad);

  // update function
  setInterval(function() {
    // check and execute timer commands here
    for(var i in settings.commands) {
      var cmd = settings.commands[i];
      var user = require('./user.js');
      if(!cmd.p.isLoaded) {
        continue;
      }
      if(cmd.p.properties.channelID.indexOf(obj.p.properties._id) != -1) {
        if(cmd.canExecuteTimer() && obj.p.properties.isLive) {
          obj.commandQueue.push({command: cmd, msg: {
            content: [],
            sender: new user.User('#internal#'),
            type: 'PRIVMSG',
            channeName: obj.p.properties.channel,
            id: '#internal#',
            tags: {}
          },
          channel: obj});
        }
      }
    }

    obj.p.save();
  }, 60 * 1000);
}

Channel.prototype = {
  afterLoad: function(p) {
    if(typeof(p.cs) != 'undefined') {
      p.p.setDefaults(p.cs, true);
    }

    p.p.setDefaults(p.defaults);
    if(p.p.properties.shouldJoin) {
      p.join();
    }
  },

  join: function() {
    var tmi = require("./tmiconnection.js");
    this.connected = true;
    this.p.properties.shouldJoin = true;
    log.log('Creating connection for channel ' + this.p.properties.channel);
    if(this.p.properties.useDefaultLogin && this.p.botName == '' && this.p.botoauth == '') {
      this.connection = new tmi.ConnectionHandler(this);
    } else if(this.p.botName != '' && this.p.botoauth != '') {
      this.connection = new tmi.ConnectionHandler(this, this.p.properties.botName,
      this.p.properties.botoauth);
    } else {
      this.connection = new tmi.ConnectionHandler(this);
    }
  },

  connect: function() {
    this.connected = true;
    this.p.properties.shouldJoin = true;
    this.connection.writeBytes('JOIN ' + this.p.properties.channel);
    if(this.p.properties.greet) {
      this.connection.sendMessage(this.p.properties.greetMessage, this);
    }
  },

  reJoin: function() {
    this.connected = false;
    this.p.properties.shouldJoin = true;
    this.connection.writeBytes('JOIN ' + this.p.properties.channel);
  },

  part: function() {
    this.connected = false;
    this.p.properties.shouldJoin = false;
    this.connection.writeBytes('PART ' + this.p.properties.channel);
  },

  message: function(message) {
    var callback = this.commandCallback;

    if(message.service == 'discord') {
      callback = this.discordCommandCallback;
    }
    // parse commands here and add them to the queue
    if((message.type == 'PRIVMSG' && message.service == 'twitch') || (message.service == 'discord')) {
      // apply automod filter if required
      if(this.p.properties.automod) {
        automod.executeFilter(message, this);
      }
      // set last activity
      if(message.sender != null) {
        message.sender.lastActivity[this.p.properties._id] = Math.floor(Date.now() / 1000);
      }

      for(var key in settings.commands) {
        var cmd = settings.commands[key];
        if(!cmd.p.isLoaded) {
          continue;
        }

        if((cmd.p.properties.channelID.indexOf(this.p.properties._id) == -1)
          && (cmd.p.properties.channelID.indexOf('#all#') == -1)) {
            continue;
        }
        if(!cmd.p.properties.textTrigger) {
          if(cmd.p.properties.name.indexOf(message.content[0]) != -1) {
            this.commandQueue.push({command: cmd, msg: message,
            channel: this, callback: callback, other: message.other});
          }
        } else {
          for(var i in message.content) {
            if(cmd.p.properties.name.indexOf(message.content[i]) != -1) {
              this.commandQueue.push({command: cmd, msg: message,
              channel: this, callback: callback, other: message.other});
            }
          }
        }

      }

    }
  },

  commandCallback: function(messages, channel, sender, command, data, other) {
    for(message in messages) {
      channel.connection.sendMessage(messages[message], channel, sender, command, data, true);
    }
  },

  discordCommandCallback: function(messages, channel, sender, command, data, other) {
    var text = require('./text.js');
    for(message in messages) {
      try {
        other.reply(text.formatText(messages[message], false, channel, sender, command, data));
      } catch(err) {
        log.log(err);
      }
    }
  },

  disconnect: function() {
    this.connected = false;
  }
}

module.exports = {
  Channel
}
