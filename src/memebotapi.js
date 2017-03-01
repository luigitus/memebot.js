var app = require('express')();
var http = require('http').Server(app);
var settings = require('./settings.js');
var io = require('socket.io').listen(http);
var log = require('./mlog.js');
var express = require('express');
var cookieParser = require('cookie-parser');
var twitchapi = require('./twitchapi.js');
var querystring = require('querystring');

module.exports = {
  initweb: function() {
    // Websocket
    io.sockets.on('connection', function (socket) {
	     socket.emit('chat', {time: new Date(), text: 'You are connected to the server!'});
	     socket.on('chat', function (data) {

		   io.sockets.emit('chat', {time: new Date(), name: data.name || 'null', text: data.text});
	    });
    });


    // deliver website
	  app.use(express.static('./web/public'));
    app.use(cookieParser()); // use this apps cookies like this JSON.parse(req.cookies.login);

    app.get('/test', function (req, res) {
    	res.sendfile('./web/public/test.html');
    });

    app.get('/', function (req, res) {
      res.sendfile('./web/public/index.html');
    });

    app.get('/commandlist', function (req, res) {
      res.sendfile('./web/public/commandlist.html');
    });

    app.get('/authenticated', function (req, res) {
      twitchapi.TwitchAPI.requestAccessToken(req.query.code, function(data) {
        if(typeof data.error !== 'undefined') {
          log.log(data);
          res.sendfile('./web/public/authenticated.html');
        }
        var jsondata = JSON.parse(data);
        twitchapi.TwitchAPI.getChannelFromOauth(jsondata.access_token, function(channeldata) {
          var jsonChannelData = JSON.parse(channeldata);
          jsondata._id = jsonChannelData._id;
          jsondata.username = jsonChannelData.display_name;
          res.cookie('login', JSON.stringify(jsondata));
          res.sendfile('./web/public/authenticated.html');
        });
      });
    });

    app.get('/logout', function (req, res) {
      res.clearCookie('login');
      res.sendfile('./web/public/logout.html');
    });

    // api calls are implemented here

    app.get('/api/v1/info', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.send({data: settings.build, appinfo: {clientid: settings.gs.clientid,
      redirecturl: settings.gs.url + settings.gs.redirecturl, baseurl: settings.gs.url,
      scopes: settings.gs.scope
      }, links : {}});
    });

    app.get('/api/v1/channel', function(req, res) {
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

    app.get('/api/v1/channellist', function(req, res) {
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
          resData[i] = {links : {channel : settings.gs.url + '/api/v1/channel?id=' +
          settings.joinedChannels[i].p.properties._id},
          name : settings.joinedChannels[i].p.properties.channel
          };
        }

        counter++;
      }
      res.send({data: resData, links : {}});
    });

    app.get('/api/v1/user', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var user = settings.users[req.query.id];
      if(typeof user !== 'undefined') {
        res.send({data: user.p.properties, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/userlist', function(req, res) {
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
          resData[i] = {links : {user : settings.gs.url + '/api/v1/user?id=' +
          settings.users[i].p.properties._id},
          name : settings.users[i].p.properties.username
          };
        }

        counter++;
      }
      res.send({data: resData, links : {}});
    });

    app.get('/api/v1/command', function(req, res) {
      res.setHeader('Content-Type', 'application/json');

      var command = settings.commands[req.query.id];
      if(typeof command !== 'undefined') {
        res.send({data: command.p.properties, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/commandlist', function(req, res) {
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
          resData[i] = {links : {command : settings.gs.url + '/api/v1/command?id=' +
          settings.commands[i].p.properties._id},
          name: settings.commands[i].p.properties.name
          };
        }

        counter++;
      }
      res.send({data: resData, links : {}});
    });

    app.get('*', function(req, res){
      res.sendfile('./web/public/notfound.html');
    });

    http.listen(settings.gs.expressport, function(){
      log.log('listening on *:' + settings.gs.expressport);
    });
  }
}
