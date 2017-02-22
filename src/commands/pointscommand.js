var PointsCommand = function(base) {
  // inherit prototype
  this.p = base;
}

PointsCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data.length == 1) {
      return ['{sender}: You have {points} {currency}']
    }

    return ['Error', 'This is a test'];
  }
}

module.exports = {
  PointsCommand
}
