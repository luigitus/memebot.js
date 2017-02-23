var fs = require('fs');
var settings = require('./settings.js');
var base = require('./baseobj.js');
var cd = require('./cooldown.js');
var cr = require('./commandreference.js');

var Command = function(id, cs) {
  this.p = new base.BaseObject(id, 'commands', this);
  var obj = this;
  this.cs = cs;
  this.globalCooldown = new cd.Cooldown(0);
  this.userCooldowns = {};
  this.p.defaults = {
    _id: id,
    name: ['!unknown'],
    channelID: ['#all#'],
    ownerChannelID: '#internal#',
    cooldownLength: 0,
    helptext: [],
    types: ['default'],
    output: [],
    prefix: '',
    suffix: '',
    cost: 0,
    counter: 0,
    locked: false,
    textTrigger: false,
    requriedCommandPower: settings.commandPower.user,
    userCooldownLenght: 0,
    enabled: true,
    timesExecuted: 0,
    formatData: true,
    useWhisper: false,
    hideCommand: false,
    suggestedList: [],
    listContent: [],
    isTimer: false,
    timer: 100,
    chance: 100
  }

  this.p.load(this.afterLoad);

  // update function
  setInterval(function() {
    obj.p.save();
  }, 60 * 1000);
}

Command.prototype = {
  afterLoad: function(p) {
    if(typeof(p.cs) != 'undefined') {
      p.p.setDefaults(p.cs, true);
    }
    p.p.setDefaults(p.p.defaults);

    p.cooldown = new cd.Cooldown(0);

    // create command type objects
    p.scripts = [];
    for(var i = 0; i < p.p.properties.types.length; i++) {
      var newScript = new cr[p.p.properties.types[i]](p);
      p.scripts.push(newScript);
    }

    // create cooldowns
    this.globalCooldown = new cd.Cooldown(p.p.properties.cooldownLength);
    this.userCooldowns = {};
  },

  execute: function(data, channel, sender, callback) {
    if(!settings.checkCommandPower(sender.p.properties.commandpower[channel.p.properties._id],
    this.p.properties.requriedCommandPower)) {
      callback(['{sender}: You do not have sufficient permission to run this command!'], channel, sender);
      return;
    }
    if(settings.getRandomInt(0, 100) >= this.p.properties.chance) {
      return;
    }
    if(!this.globalCooldown.canContinue()) {
      console.log(this.globalCooldown.getRemainder());
      return;
    }
    if(typeof this.userCooldowns[sender.p.properties._id] !== 'undefined') {
      if(!this.userCooldowns[sender.p.properties._id].canContinue()) {
        return;
      } else {
        delete this.userCooldowns[sender.p.properties._id];
      }
    }

    this.userCooldowns[sender.p.properties._id] = new cd.Cooldown(this.p.properties.userCooldownLenght);
    this.userCooldowns[sender.p.properties._id].startCooldown();
    if(this.p.properties.cooldownLength != this.globalCooldown.cooldownLength) {
      this.globalCooldown = new cd.Cooldown(this.p.properties.cooldownLength);
    }
    this.globalCooldown.startCooldown();

    if(this.p.properties.enabled) {
      for(var i = 0; i < this.scripts.length; i++) {
        if(this.scripts[i] != null && typeof this.scripts[i] !== 'undefined') {
          callback(this.scripts[i].execute(data, channel, sender), channel, sender, this, data);
        }
      }

      this.p.properties.timesExecuted++;
      this.p.save();
    }
  }
}

module.exports = {
  Command
}
