var log = require('./mlog.js');

// this is a collection of functions that will help import old date to a new database
// all import commands take a json converted from a bson
// the database that is to be imported has to be created by memebotj (the old version of memebot)
// the callbacks are used for the http request that will be needed to check user ids
module.exports = {
  importCommandFromLegacyDB: function(fileToImport) {

  },

  importUserCallback: function(username, data) {

  },

  importUserFromLegacyDB: function(fileToImport) {

  },

  importChannelCallback: function(username, data) {

  },

  importChannelFromLegacyDB: function(fileToImport) {

  },

  bsonToJson: function(input, output) {
    var fs = require('fs');
    var BsonJsonTransform = require('bson-json-transform');

    fs
    .createReadStream(input)
    .pipe(BsonJsonTransform({ preserveInt64: 'string', arrayOfBsons: true}))
    .pipe(fs.createWriteStream(output))
    .on('end', function (data) {
        log.log('Done exporting bson to json!');
    });
  }
}
