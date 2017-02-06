var fs = require('fs');
var log = require("./mlog.js");

module.exports = {
  gs: {},

  readSettings: function(file) {
    var contents = fs.readFileSync(file, 'utf8');

    this.gs = JSON.parse(contents);
  }
}
