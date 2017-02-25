var base = require('./baseobj.js');
var settings = require('./settings.js');
var util = settings;

var User = function(id, cs) {
  this.path = '';
  this.inChannels = [];
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
    timeJoined: 0,
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
    for(var c in obj.inChannels) {
      var currentChannel = settings.getChannelByID(obj.inChannels[c]);

      if(currentChannel != null) {
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
    }

    obj.p.save();
  }, 60 * 1000);
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
    if(settings.checkCommandPower(this.commandPower(channelid), 75)) {
      return true;
    }
    if(this.p.properties[channelid] >= amount) {
      this.p.properties[channelid] = this.p.properties[channelid] - amount;
      return true;
    }

    return false;
  }
}

module.exports = {
  User
}
