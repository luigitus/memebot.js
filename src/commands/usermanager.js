var settings = require('../settings.js');

var UserManager = function(base) {
  // inherit prototype
  this.p = base;
}

UserManager.prototype = {
  execute: function(data, channel, sender) {
    return ['To be implemented'];
  }
}

module.exports = {
  UserManager
}
