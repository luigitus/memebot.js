var Cooldown = function(length) {
  this.cooldownLength = length;
  this.cooldownStart = 0;
  this.cooldownEnd = 0;
}

Cooldown.prototype = {
  startCooldown: function(offset) {
    if(isNaN(offset)) {
      offset = 0;
    }
    var time = Math.floor(Date.now() / 1000);
    this.cooldownStart = time;
    this.cooldownEnd = time + this.cooldownLength + offset;
  },

  canContinue: function() {
    if(isNaN(this.cooldownEnd)) {
      return true;
    }
    return this.cooldownEnd <= Math.floor(Date.now() / 1000);
  },

  getRemainder: function() {
    return this.cooldownEnd - Math.floor(Date.now() / 1000);
  }
}

module.exports = {
  Cooldown
}
