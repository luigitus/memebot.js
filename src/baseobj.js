var settings = require('./settings.js');
var fs = require('fs');
var log = require('./mlog.js');

/*
this object can be used by most object as a base of general purpose
utility functions
*/
module.exports = {
  BaseObject: {
    properties: {},
    path: '',
    defaults: {},

    init: function(_p) {
      this.p = _p;
    },

    load: function() {
      try {
        data = fs.readFileSync(this.path, 'utf8');
        this.properties = JSON.parse(data);
      } catch(err) {}
    },

    save: function() {
      fs.writeFile(this.path, JSON.stringify(this.properties), function(err) {
        if(err) {
          return log.log(err);
        }
      });
    },

    setDefaults: function(defaults) {
      var obj = this;
      function createProperty(key, value) {
        if(!(key in obj.properties)) {
          obj.properties[key] = value;
        }
      }

      for(var key in defaults) {
        createProperty(key, defaults[key]);
      }

      //console.log(this.properties)
    },
  }
}
