var fs = require('fs');
var log = require("./mlog.js");

module.exports = {
  gs: {},
  ch: {},
  build: {
    appName: 'memebot',
    version: '1.0.0',
    dev: ''
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

  readChannels: function(path) {
    this.ch = fs.readdirSync(path);
  }
}
