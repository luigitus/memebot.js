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
  this.wasRemoved = false;
}

BaseObject.searchObjects = function(path, searchQuery, callback) {
  settings.db[path].find({_id: this.properties._id}, function(err, doc) {
    if(err != null) {
      log.log(err);
    }
    if(doc != null) {
    }
    callback(doc);
  });
}

BaseObject.prototype = {
  load: function(callback, doc) {
    // if doc is undefined just load from database
    if(typeof doc === 'undefined') {
      log.log(this.path + '>> Loading from database: ' + this.properties._id.toString())
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
    } else {
      // set the doc instead
      log.log(this.path + '>> Loading overwritten by doc: ' + this.properties._id.toString());
      this.isLoaded = true;
      obj.wasLoaded = true;
      this.setDefaults(doc, true);
      callback(this.p);
    }
  },

  save: function(callback) {
    // if command was removed do not save!
    if(this.wasRemoved) {
      log.log('Skipping save of object: ' + this.properties._id + ' because it was deleted!');
      return;
    }
    var obj = this;

    if(!this.isLoaded) {
      return;
    }

    settings.db[this.path].update({_id: this.properties._id}, this.properties, {upsert: true}, function(err, numReplaced, upsert) {
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

      if(upsert) {
        log.log('Inserted new document upon saving! ' + obj.path + ' ' + obj.properties._id);
      }
    });
  },

  remove: function(callback) {
    var obj = this;
    settings.db[this.path].remove({_id: this.properties._id}, {}, function(err, numRemoved) {
      log.log('Removed ' + numRemoved + ' id: ' + obj.properties._id);
      if(err != null) {
        log.log(err);
      } else {
        obj.wasRemoved = true;
        callback(obj.properties._id);
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
  }
}

module.exports = {
  BaseObject
}
