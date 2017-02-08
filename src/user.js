var base = require('./baseobj.js');
var settings = require('./settings.js');
var util = require('./utility.js');

module.exports = {
  User: {
    properties: {},
    path: '',
    inChannels: [],
    cooldowns: {},

    init: function(id) {
      this.p = Object.create(base.BaseObject);
      this.p.init(this);
      var obj = this;
      this.p.path = settings.gs.paths['users'] + '/' + id + '.json';

      this.p.defaults = {
        points: {}, // an array of points per channel
        timeouts: 0,
        commandpower: 10,
        commandPowerModifier: 0,
        isCat: false,
        autoGreetMessage: '',
        enableAutogreet: true,
        timeJoined: 0,
        newUser: true,
        wonJackpots: 0,
        _id: id,
        username: '',
        displayName: ''
      };

      this.p.load();
      this.p.setDefaults(this.p.defaults);

      // update function
      setInterval(function() {
        for(var c in obj.inChannels) {
          var currentChannel = util.getChannelByName(c);

          if(!(typeof(currentChannel) === 'undefined')) {
            obj.p.points[c] += currentChannel.p.pointsperupdate;
          }
        }

        obj.p.save();
      }, 60 * 1000);
    },

    commandPower: function() {
      return this.p.properties.commandPower + this.p.properties.commandPowerModifier;
    }
  }
}
