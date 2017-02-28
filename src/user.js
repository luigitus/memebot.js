var base = require('./baseobj.js');
var settings = require('./settings.js');
var util = settings;

var User = function(id, cs) {
  this.path = '';
  this.inChannels = [];
  this.lastActivity = {};
  this.shouldSendGreet = {};
  this.cooldowns = {};
  this.cs = cs;
  this.p = new base.BaseObject(id, 'users', this);
  var obj = this;

  this.p.defaults = {
    points: {}, // an array of points per channel
    timeouts: 0,
    commandpower: {},
    commandPowerModifier: {},
    isCat: false,
    autoGreetMessage: {},
    enableAutogreet: true,
    newUser: true,
    wonJackpots: 0,
    _id: id,
    username: '',
    displayName: '',
    joined_t: 0
  };

  this.p.load(this.afterLoad);

  // update function
  setInterval(function() {
    if(!obj.isLoaded) {
      return;
    }
    for(var c in obj.inChannels) {
      var currentChannel = settings.getChannelByID(obj.inChannels[c]);

      if(currentChannel != null) {
        // check for autoGreetMessage
        if(obj.shouldSendGreet[obj.inChannels[c]]) {
          obj.shouldSendGreet[obj.inChannels[c]] = false;
          currentChannel.connection.writeBytes('PRIVMSG ' + currentChannel.p.properties.channel +
          ' : ' + obj.p.properties.autoGreetMessage[obj.inChannels[c]]);
        }

        if(currentChannel.p.properties.isLive || currentChannel.p.properties.offlinepoints) {
          if(obj.p.properties.points[obj.inChannels[c]] == null ||
            isNaN(obj.p.properties.points[obj.inChannels[c]])) {
            obj.p.properties.points[obj.inChannels[c]] = 0;
          }
          if(obj.p.properties.points[obj.inChannels[c]] < 0) {
            obj.p.properties.points[obj.inChannels[c]] = 0;
          }
          obj.p.properties.points[obj.inChannels[c]] += currentChannel.p.properties.pointsperupdate;
        }
      }

      // check activity
      var currentTime = Math.floor(Date.now() / 1000);
      if(currentTime > (obj.lastActivity[obj.inChannels[c]] + 3600)) {
        delete obj.lastActivity[obj.inChannels[c]];
        obj.inChannels.splice(c, 1);
      }
      if(obj.inChannels.length == 0) {
        // todo remove user from list here
      }
    }

    obj.p.save();
  }, 60 * 1000 * 10);
}

User.prototype = {
  afterLoad: function(p) {
    if(typeof(p.cs) != 'undefined') {
      p.p.setDefaults(p.cs, true);
    }
    p.p.setDefaults(p.p.defaults);
  },

  commandPower: function(channelID) {
    if(isNaN(this.p.properties.commandPowerModifier[channelID])) {
      return this.p.properties.commandpower[channelID];
    }
    return this.p.properties.commandpower[channelID] + this.p.properties.commandPowerModifier[channelID];
  },

  payPoints: function(channelid, amount) {
    if(amount <= 0) {
      return true;
    }
    if(settings.checkCommandPower(this.commandPower(channelid), 75)) {
      return true;
    }
    if(this.p.properties.points[channelid] >= amount) {
      this.p.properties.points[channelid] = this.p.properties.points[channelid] - amount;
      return true;
    }

    return false;
  },

  receivePoints: function(channelid, amount) {
    if(isNaN(this.p.properties.points[channelid])) {
      this.p.properties.points[channelid] = 0;
    }
    this.p.properties.points[channelid] = this.p.properties.points[channelid] + amount;
  }
}

module.exports = {
  User
}
