var sprintf = require("sprintf-js").sprintf;
var settings = require('../settings.js');

var DampeCommand = function(base) {
  // inherit prototype
  this.p = base;
  // new dampe jackpot is shared accross channels (what could possibly go wrong JKStyle)
  this.p.p.setDefaults({mincost : 5, jackpot : 0, winner: '@tgump ,', winamount: 0});
}

DampeCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'jackpot') {
      // set success to false so cooldown won't trigger #hacky
      this.p.p.success = false;
      return [sprintf('{sender}: Current Dampe jackpot: %d {currency}',
      this.p.p.properties.jackpot)];
    } else if(data[1] == 'winner') {
      this.p.p.properties.success = false;
      return [sprintf('{sender}: The last person who won the jackpot was %s. They won %d {currency}.',
      this.p.p.properties.winner, this.p.p.properties.winamount)];
    } else {
      var roll = settings.getRandomInt(0, 1000);
      var amount = parseInt(data[1]);
      if(isNaN(amount) || amount < 2) {
        amount = 2;
      }
      if(!sender.payPoints(channel.p.properties._id, amount)) {
        return ['{sender}: Sorry, you do not have enough {currency}!'];
      }

      if(roll <= 10 && channel.p.properties.isLive) {
        this.p.p.properties.winner = sender.p.properties.displayName;
        this.p.p.properties.winamount = this.p.p.properties.jackpot;
        sender.receivePoints(channel.p.properties._id, this.p.p.properties.jackpot)
        var buffer = this.p.p.properties.jackpot;
        channel.p.properties._id, this.p.p.properties.jackpot = 0;
        return [sprintf('{sender}: Dampé found the Jackpot of %d {currency}! Damn, you\'re good',
        buffer)]
      } else if(roll < 60) {
        sender.receivePoints(channel.p.properties._id, amount * 4)
        return [sprintf('{sender}: Dampé found a lot of cash! He quadrupled your bet and gave you a hookshot!')]
      } else if(roll < 210) {
        sender.receivePoints(channel.p.properties._id, amount * 2)
        return [sprintf('{sender}: Dampé found a lot of cash! He doubled your bet!')]
      } else if(roll < 499) {
        sender.receivePoints(channel.p.properties._id, (amount / 2) * -1)
        this.p.p.properties.jackpot = this.p.p.properties.jackpot + (amount / 2);
        return [sprintf('{sender}: Dampé stole half of your bet and burnt you with his flame! What a dingus!')]
      } else if(roll < 995) {
        sender.receivePoints(channel.p.properties._id, amount * -1)
        this.p.p.properties.jackpot = this.p.p.properties.jackpot + amount;
        return ['{sender}: Dampé is being a dick and stole all of your {currency}!'];
      } else {
        sender.receivePoints(channel.p.properties._id, (amount * 2) * -1)
        this.p.p.properties.jackpot = this.p.p.properties.jackpot + (amount * 2);
        return ['{sender}: Dampé is not having any of your crap today and dug up a rupoor, he stole TWICE the amount you bet!'];
      }
    }
  }
}

module.exports = {
  DampeCommand
}
