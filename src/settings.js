var fs = require('fs');
var log = require("./mlog.js");

module.exports = {
  gs: {},
  ch: {},
  users: {},
  commands: {},
  build: {
    appName: 'memebot.js',
    version: '1.0.0',
    dev: 'Lukas Myers'
  },

  readSettings: function(file) {
    var contents;
    try {
      contents = fs.readFileSync(file, 'utf8');
    } catch(err) {
      contents = fs.readFileSync('../' + file, 'utf8');
      log.log(err);
    }

    this.gs = JSON.parse(contents);
  },

  readDirs: function() {
    this.users = fs.readdirSync(this.gs.paths.users);
    this.ch = fs.readdirSync(this.gs.paths.channels);
    this.commands = fs.readdirSync(this.gs.paths.commands);
  }
}
