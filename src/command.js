var fs = require('fs');
var settings = require('./settings.js');

module.exports = {
  Command: {
    properties: {},
    path: '',

    init: function(id) {
      var obj = this;
      this.path = settings.gs.paths['commands'] + '/' + id + '.json';
      contents = fs.readFile(this.path, 'utf8', function(err, data) {
        if(err) throw err;
        obj.properties = JSON.parse(data);
      });

    },

    save: function() {
      fs.writeFile(this.path, JSON.stringify(this.properties), function(err) {
        if(err) {
          return console.log(err);
        }
      });
    },

    execute: function(params, sender, callback) {

    }
  }
}
