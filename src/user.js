module.exports = {
  User: {
    properties: {},
    path: '',

    init: function(id) {
      var obj = this;
      this.path = settings.gs.paths['users'] + '/' + id + '.json';
      contents = fs.readFile(this.path, 'utf8', function(err, data) {
        if(err) throw err;
        obj.properties = JSON.parse(data);
      });

      this.setDefaults();

      // update function
      setInterval(function() {
        obj.save();
      }, 60 * 1000);
    }

    setDefaults: function() {

    },

    save: function() {
      fs.writeFile(this.path, JSON.stringify(this.properties), function(err) {
        if(err) {
          return console.log(err);
        }
      });
    },
  }
}
