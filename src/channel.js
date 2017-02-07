var tmi = require("./tmiconnection.js");
var settings = require('./settings.js');
var fs = require('fs');

module.exports = {
  Channel: {
    connection: null,
    properties: {},
    path: '',

    init: function(id) {
      this.path = settings.gs.paths['channels'] + '/' + id + '.json';
      data = fs.readFileSync(this.path, 'utf8');
      this.properties = JSON.parse(data);

      if(this.properties.shouldJoin) {
        this.connection = Object.create(tmi.ConnectionHandler);
        this.connection.init(this);
      }
    },

    save: function() {
      fs.writeFile(this.path, JSON.stringify(this.properties), function(err) {
        if(err) {
          return console.log(err);
        }
      });
    },

    connect: function() {
      this.connection.writeBytes('JOIN ' + this.properties.channel);
      this.connection.sendMessage('Hello, I am fake memebot. RitzMitz', this.properties.channel);
    },

    message: function(message) {
      if(message.type == 'PRIVMSG') {
        // this is just a test
        if(message.content[0] == '!about') {
          this.connection.sendMessage('Literally a test', this.properties.channel);
        }
      }
    },

    disconnect: function() {

    }
  }
}
