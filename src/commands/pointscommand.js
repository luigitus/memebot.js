var settings = require('../settings.js');
var sprintf = require("sprintf-js").sprintf;

var PointsCommand = function(base) {
  // inherit prototype
  this.p = base;
}

PointsCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'send') {
      var target = settings.getUserByName(data[2]);
      var pointsToSend = parseFloat(data[3]);
      if(target) {
        sender.p.properties.points[channel.p.properties._id] -= pointsToSend;
        target.p.properties.points[channel.p.properties._id] += pointsToSend;
        return [sprintf('{sender}: You sent %i to %s!', pointsToSend, data[2])];
      } else {
        return ['{sender}: This user is currently not in chat!'];
      }
    } else {
      return ['{sender}: You have {points} {currency}']
    }
  }
}

module.exports = {
  PointsCommand
}
