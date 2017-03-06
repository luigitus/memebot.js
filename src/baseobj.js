var fs = require('fs');
var log = require('./mlog.js');
var settings = require('./settings.js');

/*
this object can be used by most object as a base of general purpose
utility functions
*/
var BaseObject = function(id, path, _p) {
  this.p = _p;
  this.properties = {};
  this.properties._id = id;
  this.path = path;
  this.defaults = {};
  this.wasLoaded = false;
  this.isLoaded = false;
}

BaseObject.prototype = {
  load: function(callback) {
    var obj = this;
    settings.db[this.path].find({_id: this.properties._id}, function(err, doc) {
      if(err != null) {
        log.log(err);
      }
      if(doc != null) {
        obj.setDefaults(doc[0], true);

        obj.wasLoaded = true;
      }
      obj.isLoaded = true;
      obj.setDefaults(obj.defaults);
      callback(obj.p);
    });
    /*try {
      data = fs.readFileSync(this.path, 'utf8');
      this.properties = JSON.parse(data);
    } catch(err) {}*/
  },

  save: function(callback) {
    var obj = this;

    if(!this.isLoaded) {
      return;
    }

    settings.db[this.path].update({_id: this.properties._id}, this.properties, {}, function(err, numReplaced) {
      if(err != null) {
        log.log(err);
        if(err.errorType == 'uniqueViolated') {
          // todo make sure to change id! (this should never happen anyway!)
        }

        settings.dberrors++;
        if(settings.dberrors > settings.gs.maxdberrors) {
          log.log('Max db errors reached! Exiting.');
          settings.quit(1);
        }
      }

      if(numReplaced == 0) {
        settings.db[obj.path].insert(obj.properties, function(err, newDoc) {
          if(err != null) {
            log.log(err);
          }
          obj.wasLoaded = true;
        });
      }
    });
  },

  remove: function() {
    settings.db[this.path].remove({_id: this.properties._id}, {}, function(err, numRemoved) {
      if(err != null) {
        log.log(err);
      }
    });
  },

  isInDatabase: function() {

  },

  setDefaults: function(defaults, forceOverride) {
    for(var key in defaults) {
      if(!(key in this.properties) || forceOverride) {
        this.properties[key] = defaults[key];
      }
    }

    //console.log(this.properties)
  }
}

module.exports = {
  BaseObject
}
