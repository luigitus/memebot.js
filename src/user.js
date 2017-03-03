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
    joined_t: 0,
    defaultPoints: 100
  };

  this.p.load(this.afterLoad);

  // update function
  setInterval(function() {
    if(!obj.p.isLoaded) {
      return;
    }
    for(var c in obj.inChannels) {
      var currentChannel = settings.getChannelByID(obj.inChannels[c]);

      if(currentChannel != null) {
        // check for autoGreetMessage
        if(obj.shouldSendGreet[obj.inChannels[c]]) {
          obj.shouldSendGreet[obj.inChannels[c]] = false;
          if(typeof obj.p.properties.autoGreetMessage[obj.inChannels[c]] !== 'undefined') {
            currentChannel.connection.writeBytes('PRIVMSG ' + currentChannel.p.properties.channel +
            ' : ' + obj.p.properties.autoGreetMessage[obj.inChannels[c]]);
          }
        }
        if(currentChannel.p.properties.isLive || currentChannel.p.properties.offlinepoints) {
          obj.pointsCheck(currentChannel.p.properties._id);
          obj.receivePoints(obj.inChannels[c], currentChannel.p.properties.pointsperupdate);
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
    this.pointsCheck(channelid);
    if(amount <= 0) {
      return true;
    }

    if(this.p.properties.points[channelid] >= amount) {
      this.p.properties.points[channelid] = this.p.properties.points[channelid] - amount;
      return true;
    }

    if(settings.checkCommandPower(this.commandPower(channelid), 75)) {
      return true;
    }

    return false;
  },

  receivePoints: function(channelid, amount) {
    this.pointsCheck(channelid);
    this.p.properties.points[channelid] = this.p.properties.points[channelid] + amount;
  },

  getPoints: function(channelid) {
    this.pointsCheck(channelid);
    return this.p.properties.points[channelid];
  },

  pointsCheck: function(channelid) {
    if(isNaN(this.p.properties.points[channelid])) {
      this.p.properties.points[channelid] = this.p.properties.defaultPoints;
    }
    if(this.p.properties.points[channelid] < 0) {
      this.p.properties.points[channelid] = 0;
    }
  }
}

module.exports = {
  User
}
