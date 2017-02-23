var app = require('express')();
var http = require('http').Server(app);
var settings = require('./settings.js');

module.exports = {
  initweb: function() {
    app.get('/api/v1/info', function(req, res){
      res.setHeader('Content-Type', 'application/json');
      res.send({data: settings.build, links : {}});
    });

    app.get('/api/v1/channel', function(req, res){
      res.setHeader('Content-Type', 'application/json');
      var channel = settings.joinedChannels[req.query.id];
      if(typeof channel !== 'undefined') {
        var datatosend = JSON.parse(JSON.stringify(channel.p.properties));
        datatosend.botoauth = null;
        res.send({data: datatosend, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/channellist', function(req, res){
      res.setHeader('Content-Type', 'application/json');

      var page = parseInt(req.query.page);
      if(typeof page === 'undefined' || isNaN(page)) {
        page = 0;
      }
      var startAt = page * 100;
      var itemsPerPage = startAt + 100;
      var counter = 0;
      var resData = {};
      for(var i in settings.joinedChannels) {
        if(counter >= startAt && counter < itemsPerPage) {
          resData[i] = settings.gs.url + '/api/v1/channel?id=' +
          settings.joinedChannels[i].p.properties._id;
        }

        counter++;
      }
      res.send({data: resData, links : {}});
    });

    app.get('/api/v1/user', function(req, res){
      res.setHeader('Content-Type', 'application/json');
      var user = settings.users[req.query.id];
      if(typeof user !== 'undefined') {
        res.send({data: user.p.properties, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/userlist', function(req, res){
      res.setHeader('Content-Type', 'application/json');

      var page = parseInt(req.query.page);
      if(typeof page === 'undefined' || isNaN(page)) {
        page = 0;
      }
      var startAt = page * 100;
      var itemsPerPage = startAt + 100;
      var counter = 0;
      var resData = {};
      for(var i in settings.users) {
        if(counter >= startAt && counter < itemsPerPage) {
          resData[i] = settings.gs.url + '/api/v1/user?id=' +
          settings.users[i].p.properties._id;
        }

        counter++;
      }
      res.send({data: resData, links : {}});
    });

    app.get('/api/v1/command', function(req, res){
      res.setHeader('Content-Type', 'application/json');

      var command = settings.commands[req.query.id];
      if(typeof command !== 'undefined') {
        res.send({data: command.p.properties, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/commandlist', function(req, res){
      res.setHeader('Content-Type', 'application/json');

      var page = parseInt(req.query.page);
      var channelID = req.query.channelid;

      if(typeof page === 'undefined' || isNaN(page)) {
        page = 0;
      }
      var startAt = page * 100;
      var itemsPerPage = startAt + 100;
      var counter = 0;
      var resData = {};
      for(var i in settings.commands) {
        if(counter >= startAt && counter < itemsPerPage) {
          if(typeof channelID != 'undefined') {
            if(channelID != settings.commands[i].p.properties.ownerChannelID) {
              continue;
            }
          }
          resData[i] = settings.gs.url + '/api/v1/command?id=' +
          settings.commands[i].p.properties._id;
        }

        counter++;
      }
      res.send({data: resData, links : {}});
    });

    http.listen(3000, function(){
      console.log('listening on *:3000');
    });
  }
}
