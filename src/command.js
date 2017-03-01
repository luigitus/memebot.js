var fs = require('fs');
var settings = require('./settings.js');
var base = require('./baseobj.js');
var cd = require('./cooldown.js');
var cr = require('./commandreference.js');
var sprintf = require("sprintf-js").sprintf;
var text = require('./text.js');

var Command = function(id, cs) {
  this.p = new base.BaseObject(id, 'commands', this);
  var obj = this;
  this.cs = cs;
  this.globalCooldown = new cd.Cooldown(0);
  this.timercooldown = new cd.Cooldown(0);
  this.userCooldowns = {};
  this.success = false;
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
    chance: 100,
    cooldownbypasspower: settings.commandPower.broadcaster,
    parametres: 0
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
    this.timercooldown = new cd.Cooldown(p.p.properties.timer);
    this.userCooldowns = {};
  },

  canExecuteTimer: function() {
    if(this.p.properties.isTimer) {
      if(this.timercooldown.cooldownLength != this.p.properties.timer) {
        this.timercooldown = new cd.Cooldown(this.p.properties.timer);
      }

      if(this.timercooldown.canContinue()) {
        return true;
      }
    }

    return false;
  },

  execute: function(data, channel, sender, callback) {
    // assume command was successful; scripts can cahnge that during execution
    this.success = true;
    if(!settings.checkCommandPower(sender.commandPower(channel.p.properties._id),
    this.p.properties.requriedCommandPower)) {
      callback(['{sender}: You do not have sufficient permission to run this command!'], channel, sender);
      return;
    }

    // chance execution
    if(settings.getRandomInt(0, 100) >= this.p.properties.chance) {
      return;
    }

    // check global cooldown
    if(!this.globalCooldown.canContinue()) {
      if(!settings.checkCommandPower(sender.commandPower(channel.p.properties._id), this.p.properties.cooldownbypasspower)) {
        return;
      }
    }

    // check for user cooldown
    if(typeof this.userCooldowns[sender.p.properties._id] !== 'undefined') {
      if(!this.userCooldowns[sender.p.properties._id].canContinue()) {
        if(!settings.checkCommandPower(sender.commandPower(channel.p.properties._id), this.p.properties.cooldownbypasspower)) {
          return;
        }
      } else {
        delete this.userCooldowns[sender.p.properties._id];
      }
    }


    // check payment
    if(!sender.payPoints(channel.p.properties._id, this.p.properties.cost)) {
      return [sprintf('{sender}: Sorry, you do not have %d {currency}', this.p.properties.cost)];
    }

    if(this.p.properties.enabled) {
      if(this.p.properties.formatData) {
        for(var i in data) {
          data[i] = text.formatText(data[i], false, channel, sender, this, data);
        }
      }

      // if parametres do not match return helptext
      if(data.length <= this.p.properties.parametres && this.p.properties.parametres != 0) {
        this.success = false;
        callback(this.p.properties.helptext, channel, sender, this, data);
        return;
      }
      // can be used to enable whispers, re-direct output to the website etc.
      var other = {};
      for(var i = 0; i < this.scripts.length; i++) {
        if(this.scripts[i] != null && typeof this.scripts[i] !== 'undefined') {
          callback(this.scripts[i].execute(data, channel, sender), channel, sender, this, data, other);
        }
      }

      this.p.properties.timesExecuted++;
      // cooldowns are only invoked if the command executed successfully
      if(this.success) {
        this.userCooldowns[sender.p.properties._id] = new cd.Cooldown(this.p.properties.userCooldownLenght);
        this.userCooldowns[sender.p.properties._id].startCooldown();
        if(this.p.properties.cooldownLength != this.globalCooldown.cooldownLength) {
          this.globalCooldown = new cd.Cooldown(this.p.properties.cooldownLength);
        }
        this.globalCooldown.startCooldown();
      }

      this.p.save();
    }
  }
}

module.exports = {
  Command
}
