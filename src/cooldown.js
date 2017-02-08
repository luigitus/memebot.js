module.exports = {
  Cooldown: {
    cooldownLength: 0,
    cooldownStart: 0,
    cooldownEnd: 0,

    init: function(length) {
      this.cooldownLength = length;
    },

    startCooldown: function(offset) {
      var time = Math.floor(Date.now() / 1000);
      this.cooldownStart = time;
      this.cooldownEnd = time + this.cooldownLength + offset;
    },

    canContinue: function() {
      return this.cooldownEnd <= Math.floor(Date.now() / 1000);
    }
  }
}
