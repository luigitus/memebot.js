var tmi = require("./tmiconnection.js");
var settings = require('./settings.js');
var fs = require('fs');

module.exports = {
  Channel: {
    connection: null,
    properties: {},
    path: '',
    connected: false,

    init: function(id) {
      this.path = settings.gs.paths['channels'] + '/' + id + '.json';
      try {
        data = fs.readFileSync(this.path, 'utf8');
        this.properties = JSON.parse(data);
      } catch(err) {}
      var obj = this;
      this.setDefaults();

      if(this.properties.shouldJoin) {
        this.connected = true;
        this.connection = Object.create(tmi.ConnectionHandler);
        this.connection.init(this);
      }

      // update function
      setInterval(function() {
        obj.save();
      }, 60 * 1000);
    },

    setDefaults: function() {
      var obj = this;
      function createProperty(key, value) {
        if(!(key in obj.properties)) {
          obj.properties[key] = value;
        }
      }

      createProperty('shouldJoin', true);
      createProperty('channel', '#memebot__');
      createProperty('greet', false);
      createProperty('greetMessage',
      'Hello I\'m {appname} version {version} the dankest irc bot ever RitzMitz');
      createProperty('maxfnlen', 8);
      createProperty('pointsperupdate', 1);
      createProperty('silent', false);
      createProperty('offlinepoints', false);
      createProperty('currency', 'points');

      console.log(this.properties)
    },

    save: function() {
      fs.writeFile(this.path, JSON.stringify(this.properties), function(err) {
        if(err) {
          return console.log(err);
        }
      });
    },

    connect: function() {
      this.connected = true;
      this.connection.writeBytes('JOIN ' + this.properties.channel);
      if(this.properties.greet) {
        this.connection.sendMessage(this.properties.greetMessage, this);
      }
    },

    message: function(message) {
      if(message.type == 'PRIVMSG') {
        // this is just a test
        if(message.content[0] == '!about') {
          this.connection.sendMessage('Literally a test', this);
        }
      }
    },

    disconnect: function() {
      this.connected = false;
    }
  }
}
