var tmi = require("./tmiconnection.js");
var settings = require('./settings.js');
var fs = require('fs');
var base = require('./baseobj.js');
var util = require('./utility.js');

module.exports = {
  Channel: {
    connection: null,
    connected: false,

    init: function(id) {
      this.p = Object.create(base.BaseObject);
      this.p.init(this);
      //Object.setPrototypeOf(this, base.BaseObject);
      this.p.path = settings.gs.paths['channels'] + '/' + id + '.json';
      // create defaults list
      this.defaults = {
        shouldJoin: true,
        channel: '#memebot__',
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
      this.p.load();
      this.p.setDefaults(this.defaults);

      if(this.p.properties.shouldJoin) {
        this.connected = true;
        this.connection = Object.create(tmi.ConnectionHandler);
        this.connection.init(this);
      }

      // update function
      setInterval(function() {
        obj.p.save();
      }, 60 * 1000);
    },

    connect: function() {
      this.connected = true;
      this.connection.writeBytes('JOIN ' + this.p.properties.channel);
      if(this.p.properties.greet) {
        this.connection.sendMessage(this.p.properties.greetMessage, this);
      }
    },

    message: function(message) {
      // parse commands here
      if(message.type == 'PRIVMSG') {
        // this is just a test
        for(var key in util.commands) {
          var cmd = util.commands[key];
          if(cmd.p.properties.channelID != this.p.properties._id
            && cmd.p.properties.channelID != '#all#') {
              continue;
          }
          if(message.content[0] == cmd.p.properties.name) {
            cmd.execute(message.content, this, message.sender, this.commandCallback);
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
}
