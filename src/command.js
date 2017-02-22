var fs = require('fs');
var settings = require('./settings.js');
var base = require('./baseobj.js');
var cd = require('./cooldown.js');
var cr = require('./commandreference.js');

var Command = function(id, cs) {
  this.p = new base.BaseObject(id, 'commands', this);
  var obj = this;
  this.cs = cs;
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
  },

  execute: function(data, channel, sender, callback) {
    if(!settings.checkCommandPower(sender.p.properties.commandpower[channel.p.properties._id],
    this.p.properties.requriedCommandPower)) {
      callback(['Not enough command power '], channel, sender);
      return;
    }
    if(this.p.properties.enabled) {
      for(var i = 0; i < this.scripts.length; i++) {
        callback(this.scripts[i].execute(data, channel, sender), channel, sender);
      }
    }
  }
}

module.exports = {
  Command
}
