var fs = require('fs');

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
    var dirsToCreate = [
      './config/channels',
      './config/commands',
      './config/users'
    ];

    for(i = 0; i < dirsToCreate.length; i++) {
      if (!fs.existsSync(dirsToCreate[i])) {
        fs.mkdirSync(dirsToCreate[i]);
      }
    }
  }
}
