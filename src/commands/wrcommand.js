var settings = require('../settings.js');
var srcapi = require('../srcapi.js');

var WorldRecordCommand = function(base) {
  this.p = base;
}

WorldRecordCommand.prototype = {
  execute: function(data, channel, sender, callback) {

  }
}

module.exports = {
  WorldRecordCommand
}
