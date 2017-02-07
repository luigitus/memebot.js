var fs = require('fs');
var settings = require('./settings.js');

module.exports = {
  parseCliArgs: function() {
    var args = [];

    process.argv.forEach(function (val, index, array) {
      args.push(val);
    });

    return args;
  },

  getRandomInt: function(min, max) {
    if(typeof min === 'undefined' || typeof max === 'undefined') {
      return Math.floor(Math.random());
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  minit: function() {
    for(var i in settings.gs.paths) {
      if (!fs.existsSync(settings.gs.paths[i])) {
        fs.mkdirSync(settings.gs.paths[i]);
      }
    }
  }
}
