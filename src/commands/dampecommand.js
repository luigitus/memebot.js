var sprintf = require("sprintf-js").sprintf;
var settings = require('../settings.js');

var DampeCommand = function(base) {
  // inherit prototype
  this.p = base;
  // new dampe jackpot is shared accross channels (what could possibly go wrong JKStyle)
  this.p.p.setDefaults({mincost : 2, jackpotPerChannel : {}, winner: '@tgump ,'
  , winamount: 0, winchannel: "#tGump",
  dampeJackpotText: '{sender}: Current jackpot: %d {currency}',
  dammpeLastWinnerText: '{sender}: The last person who won the jackpot was %s. They won %d {currency} in %s\'s channel.',
  notEnughMoneyText: '{sender}: Sorry, you do not have enough {currency}!',
  dampeJackpotWonText: '{sender}: Dampé found the Jackpot of %d {currency}! Damn, you\'re good',
  dampeWin1Text: '{sender}: Dampé found a lot of cash! He quadrupled your bet and gave you a hookshot!',
  dampeWin2Text: '{sender}: Dampé found a lot of cash! He doubled your bet!',
  dampeLoss1Text: '{sender}: Dampé stole half of your bet and burnt you with his flame! What a dingus!',
  dampeLoss2Text: '{sender}: Dampé is being a dick and stole all of your {currency}!',
  dampeLiss3Text: '{sender}: Dampé is not having any of your crap today and dug up a rupoor, he stole TWICE the amount you bet!',
  dampeLoss4Text: '{sender}: You gave Dampé a small loan of %i {currency}!'
  });
}

DampeCommand.prototype = {
  execute: function(data, channel, sender) {
    if(isNaN(this.p.p.properties.jackpotPerChannel[channel.p.properties._id])
    || typeof this.p.p.properties.jackpotPerChannel[channel.p.properties._id] !== 'number') {
      this.p.p.properties.jackpotPerChannel[channel.p.properties._id] = 0;
    }

    if(data[1] == 'jackpot') {
      // set success to false so cooldown won't trigger #hacky
      this.p.p.success = false;
      return [sprintf(this.p.p.properties.dampeJackpotText,
      this.p.p.properties.jackpotPerChannel[channel.p.properties._id])];
    } else if(data[1] == 'winner') {
      this.p.p.properties.success = false;
      return [sprintf(this.p.p.properties.dammpeLastWinnerText,
      this.p.p.properties.winner, this.p.p.properties.winamount, this.p.p.properties.winchannel)];
    } else {
      var roll = settings.getRandomInt(0, 1000);
      var amount = parseInt(data[1]);
      if(isNaN(amount) || amount < this.p.p.properties.mincost) {
        amount = 2;
      }
      if(!sender.payPoints(channel.p.properties._id, amount)) {
        return [this.p.p.properties.notEnughMoneyText];
      }

      if(roll <= 10 && channel.p.properties.isLive) {
        this.p.p.properties.winner = sender.p.properties.displayName;
        this.p.p.properties.winamount = this.p.p.properties.jackpotPerChannel[channel.p.properties._id];
        this.p.p.properties.winchannel = channel.p.properties.channel;
        sender.receivePoints(channel.p.properties._id, this.p.p.properties.jackpot)
        var buffer = this.p.p.properties.jackpotPerChannel[channel.p.properties._id];
        this.p.p.properties.jackpotPerChannel[channel.p.properties._id] = 0;
        return [sprintf(this.p.p.properties.dampeJackpotWonText,
        buffer)];
      } else if(roll < 60 && channel.p.properties.isLive) {
        sender.receivePoints(channel.p.properties._id, amount * 4)
        return [sprintf(this.p.p.properties.dampeWin1Text)];
      } else if(roll < 210 && channel.p.properties.isLive) {
        sender.receivePoints(channel.p.properties._id, amount * 2)
        return [sprintf(this.p.p.properties.dampeWin2Text)];
      } else if(roll < 499) {
        sender.receivePoints(channel.p.properties._id, (amount / 2))
        this.p.p.properties.jackpotPerChannel[channel.p.properties._id] = this.p.p.properties.jackpotPerChannel[channel.p.properties._id] + (amount / 2);
        return [sprintf(this.p.p.properties.dampeLoss1Text)]
      } else if(roll < 795) {
        //sender.receivePoints(channel.p.properties._id, amount * -1)
        this.p.p.properties.jackpotPerChannel[channel.p.properties._id] = this.p.p.properties.jackpotPerChannel[channel.p.properties._id] + amount;
        return [this.p.p.properties.dampeLoss2Text];
      } else if(roll < 995) {
        sender.receivePoints(channel.p.properties._id, amount * -1.5)
        this.p.p.properties.jackpotPerChannel[channel.p.properties._id] = this.p.p.properties.jackpotPerChannel[channel.p.properties._id] + amount;
        return [sprintf(this.p.p.properties.dampeLoss4Text,
        amount)];
      } else {
        sender.receivePoints(channel.p.properties._id, (amount * 2) * -1)
        this.p.p.properties.jackpotPerChannel[channel.p.properties._id] = this.p.p.properties.jackpotPerChannel[channel.p.properties._id] + (amount * 2);
        return [this.p.p.properties.dampeLiss3Text];
      }
    }
  }
}

module.exports = {
  DampeCommand
}
