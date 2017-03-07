"use strict";

var net = require('net');
var settings = require("./settings.js");
var log = require("./mlog.js");
var text = require('./text.js');
var user = require('./user.js');
var Discord = require("discord.js");
var client = new Discord.Client();

var ConnectionHandler = function() {
  var obj = this; // bind parrent object so that it can be access
  this.discordsender = new user.User('DiscordSender');
  client.on('ready', function() {
    log.log(`Logged in as ${client.user.username}`);
  });

  client.on('message', function(msg) {
    obj.parseDiscord(msg);
  });
  if(typeof settings.gs.discordtoken !== 'undefined') {
    client.login(settings.gs.discordtoken);
  }

  // update function
  setInterval(function() {
    obj.messageCount = 0;
  }, 30 * 1000);
}

ConnectionHandler.prototype = {

  writeBytes: function(message) {
  },

  parseDiscord: function(rawmessage) {
    for(var i in settings.joinedChannels) {
      if(settings.joinedChannels[i].p.properties.discordguildid == rawmessage.member.guild.id) {
        settings.joinedChannels[i].message({
          content: rawmessage.content.split(' '),
          sender: this.discordsender,
          type: undefined,
          channeName: undefined,
          id: undefined,
          tags: [],
          service: 'discord',
          other: rawmessage});
        break;
      }
    }
  },


  sendCommand: function(message, channel) {
  },

  sendMessage: function(message, channel, sender, command, data, format, whisper) {
  }
}

module.exports = {
  ConnectionHandler
}
