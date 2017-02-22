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
  };

  this.p.load(this.afterLoad);

  // update function
  setInterval(function() {
    for(var c in obj.inChannels) {
      var currentChannel = settings.getChannelByID(obj.inChannels[c]);

      if(currentChannel != null) {
        if(obj.p.properties.points[obj.inChannels[c]] == null ||
          isNaN(obj.p.properties.points[obj.inChannels[c]])) {
          obj.p.properties.points[obj.inChannels[c]] = 0;
        }
        obj.p.properties.points[obj.inChannels[c]] += currentChannel.p.properties.pointsperupdate;
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

  commandPower: function() {
    return this.p.properties.commandPower + this.p.properties.commandPowerModifier;
  }
}

module.exports = {
  User
}
