var settings = require('./settings.js');
var fs = require('fs');
var base = require('./baseobj.js');

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
    pointsperupdate: 1,
    silent: false,
    offlinepoints: false,
    currency: 'points',
    _id: id
  }

  var obj = this;
  this.p.load(this.afterLoad);

  // update function
  setInterval(function() {
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
    this.connection = new tmi.ConnectionHandler(this);
  },

  connect: function() {
    this.connected = true;
    this.connection.writeBytes('JOIN ' + this.p.properties.channel);
    if(this.p.properties.greet) {
      this.connection.sendMessage(this.p.properties.greetMessage, this);
    }
  },

  part: function() {
    this.connected = false;
    this.connection.writeBytes('PART ' + this.p.properties.channel);
  },

  message: function(message) {
    // parse commands here and add them to the queue
    if(message.type == 'PRIVMSG') {
      for(var key in settings.commands) {
        var cmd = settings.commands[key];

        if((cmd.p.properties.channelID.indexOf(this.p.properties._id) == -1)
          && (cmd.p.properties.channelID.indexOf('#all#') == -1)) {
            continue;
        }

        if(cmd.p.properties.name.indexOf(message.content[0]) != -1) {
          this.commandQueue.push({command: cmd, msg: message,
          channel: this});
        }
      }
    }
  },

  commandCallback: function(messages, channel, sender) {
    for(message in messages) {
      channel.connection.sendMessage(messages[message], channel, sender, true);
    }
  },

  disconnect: function() {
    this.connected = false;
  }
}

module.exports = {
  Channel
}
