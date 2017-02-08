var fs = require('fs');
var settings = require('./settings.js');
var base = require('./baseobj.js');
var cd = require('./cooldown.js');
var cr = require('./commandreference.js');

module.exports = {
  Command: {
    init: function(id) {
      this.p = Object.create(base.BaseObject);
      this.p.init(this);
      var obj = this;
      this.p.path = settings.gs.paths['commands'] + '/' + id + '.json';

      this.p.defaults = {
        _id: id,
        name: '',
        channelID: '#all#',
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
        requriedCommandPower: 10,
        userCooldownLenght: 0,
        enabled: true,
        timesExecuted: 0,
        formatData: true,
        useWhisper: false,
        hideCommand: false,
        suggestedList: [],
        isTimer: false,
        timer: 100,
        chance: 100
      }

      this.p.load();
      this.p.setDefaults(this.p.defaults);

      this.cooldown = Object.create(cd.Cooldown);

      // create command type objects
      this.scripts = [];
      for(var i = 0; i < this.p.properties.types.length; i++) {
        var newScript = Object.create(cr[this.p.properties.types[i]]);
        newScript.init(this);
        this.scripts.push(newScript);
      }

      // update function
      setInterval(function() {
        obj.p.save();
      }, 60 * 1000);
    },

    execute: function(data, channel, sender, callback) {
      for(var i = 0; i < this.scripts.length; i++) {
        callback(this.scripts[i].execute(data, channel, sender), channel, sender);
      }
    }
  }
}
