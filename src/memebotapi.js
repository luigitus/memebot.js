var app = require('express')();
var http = require('http').Server(app);
var settings = require('./settings.js');
var io = require('socket.io').listen(http);
var log = require('./mlog.js');
var express = require('express');
var cookieParser = require('cookie-parser');
var twitchapi = require('./twitchapi.js');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var oauthserver = require('oauth2-server');

module.exports = {
  emitWSEvent: function(eventtype, eventdata) {
    io.sockets.emit(eventtype, eventdata);
  },

  initweb: function() {
    var obj = this;
    // Websocket
    io.sockets.on('connection', function (socket) {
	    socket.emit('chat', {time: new Date(), text: 'You are connected to the server!'});
	    socket.on('chat', function (data) {
		      io.sockets.emit('chat', {time: new Date(), name: data.name || 'null', text: data.text});
	    });
      socket.on('doggy_finished', function(data) {
        var cmd = settings.getCommandByID(data._id);
        if(cmd == null) {return;}
        cmd.finishedCallback(data);
      });
    });


    // deliver website
	  app.use(express.static('./web/public'));
    app.use(cookieParser()); // use this apps cookies like this JSON.parse(req.cookies.login);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // oauth might be used in the future
    app.oauth = oauthserver({
      model: {}, // See below for specification
      grants: ['password'],
      debug: settings.gs.debug
    });

    app.all('/oauth/token', app.oauth.grant());
    app.use(app.oauth.errorHandler());

    app.get('/test', function (req, res) {
    	res.sendfile('./web/public/test.html');
    });

    app.get('/', function (req, res) {
      res.sendfile('./web/public/index.html');
    });

    app.get('/about', function (req, res) {
      res.sendfile('./web/public/about.html');
    });

    app.get('/getme', function (req, res) {
      res.sendfile('./web/public/get.html');
    });

    app.get('/channellist', function (req, res) {
      res.sendfile('./web/public/channellist.html');
    });

    app.get('/wscmd', function (req, res) {
      res.sendfile('./web/public/wscommand.html');
    });

    app.get('/commandview', function (req, res) {
      res.sendfile('./web/public/commandview.html');
    });

    app.get('/help', function (req, res) {
      res.sendfile('./web/public/help.html');
    });

    app.get('/commandlist', function (req, res) {
      res.sendfile('./web/public/commandlist.html');
    });

    app.get('/newcommand', function (req, res) {
      res.sendfile('./web/public/newcommand.html');
    });

    app.get('/privacy', function (req, res) {
      res.sendfile('./web/public/privacy.html');
    });

    app.get('/license', function (req, res) {
      res.sendfile('./web/public/license.html');
    });

    app.get('/contact', function (req, res) {
      res.sendfile('./web/public/contact.html');
    });

    app.get('/authenticated', function (req, res) {
      twitchapi.TwitchAPI.requestAccessToken(req.query.code, function(data) {
        if(typeof data.error !== 'undefined') {
          log.log(data);
          res.sendfile('./web/public/authenticated.html');
        }
        var jsondata = JSON.parse(data);
        twitchapi.TwitchAPI.getInfoFromOauth(jsondata.access_token, function(channeldata) {
          var jsonChannelData = JSON.parse(channeldata);
          if(!jsonChannelData.token.valid) {
            res.sendfile('./web/public/authenticated.html');
          } else {
            jsondata._id = jsonChannelData.token.user_id;
            jsondata.username = jsonChannelData.token.user_name;
            res.cookie('login', JSON.stringify(jsondata));
            res.sendfile('./web/public/authenticated.html');
          }
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

    app.get('/api/v1/automod', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.sendfile('./web/public/data/automod.json');
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
      var resData = [];
      var sortedObj = Object.keys(settings.joinedChannels).sort(
      function(a, b) {
        return settings.joinedChannels[a].p.properties.channel > settings.joinedChannels[b].p.properties.channel ? 1 : -1;
      });

      for(var j in sortedObj) {
        var i = sortedObj[j];
        if(counter >= startAt && counter < itemsPerPage) {
          resData.push({links : {channel : settings.gs.url + '/api/v1/channel?id=' +
          settings.joinedChannels[i].p.properties._id},
          name : settings.joinedChannels[i].p.properties.channel,
          _id : settings.joinedChannels[i].p.properties._id,
          });
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
      var resData = [];
      var sortedObj = Object.keys(settings.users).sort(
      function(a, b) {
        return settings.users[a].p.properties.username > settings.commands[b].p.properties.username ? 1 : -1;
      });

      for(var j in sortedObj) {
        var i = sortedObj[j];
        if(counter >= startAt && counter < itemsPerPage) {
          resData.push({links : {user : settings.gs.url + '/api/v1/user?id=' +
          settings.users[i].p.properties._id},
          name : settings.users[i].p.properties.username,
          id : settings.users[i].p.properties._id
          });
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
      var resData = [];
      var sortedObj = Object.keys(settings.commands).sort(
      function(a, b) {
        return settings.commands[a].p.properties.name[0] > settings.commands[b].p.properties.name[0] ? 1 : -1;
      });

      for(var j in sortedObj) {
        var i = sortedObj[j];
        if(counter >= startAt && counter < itemsPerPage) {
          if(typeof channelID != 'undefined') {
            if(channelID != settings.commands[i].p.properties.ownerChannelID) {
              continue;
            }
          }
          resData.push({links : {command : settings.gs.url + '/api/v1/command?id=' +
          settings.commands[i].p.properties._id},
          name: settings.commands[i].p.properties.name,
          _id: settings.commands[i].p.properties._id
          });
        }

        counter++;
      }
      res.send({data: resData, links : {}});
    });

    // api calls with auth
    app.get('/api/v1/removecommand', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      obj.checkTwitchLogin(token, req.query.channelid,
      req.query.channelid, function(status, data) {
        if(status) {
          res.send({data : {}, links: {}});
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/addcommand', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      obj.checkTwitchLogin(token, req.query.channelid,
      req.query.channelid, function(status, data) {
        if(status) {
          res.send({data : {}, links: {}});
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/editcommand', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      obj.checkTwitchLogin(token, req.query.channelid,
      req.query.channelid, function(status, data) {
        if(status) {
          res.send({data : {}, links: {}});
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/editchannel', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      obj.checkTwitchLogin(token, req.query.channelid,
      req.query.channelid, function(status, data) {
        if(status) {
          res.send({data : {}, links: {}});
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/edituser', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      obj.checkTwitchLogin(token, req.query.channelid,
      req.query.channelid, function(status, data) {
        if(status) {
          res.send({data : {}, links: {}});
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('*', function(req, res){
      res.sendfile('./web/public/notfound.html');
    });

    http.listen(settings.gs.expressport, function(){
      log.log('listening on *:' + settings.gs.expressport);
    });
  },

  checkTwitchLogin: function(oauth, channelid, requiredchannelid, callback) {
    //var cookiejson = JSON.parse(req.cookies.login);
    twitchapi.TwitchAPI.getInfoFromOauth(oauth, function(data) {
      data = JSON.parse(data);
      if(data.status >= 400 || !data.token.valid) {
        callback(false, data);
        return;
      }

      if(settings.gs.admins.indexOf(data.token.user_name.toLowerCase()) != -1) {
        log.log('Permitting login for admin ' + data.token.user_name);
        callback(true, data);
        return;
      }
      if(data.token.user_id == channelid && data.token.user_id == requiredchannelid &&
      data.token.valid) {
        callback(true, data);
        return;
      } else {
        callback(false, data);
        return;
      }
    });
  }
}
