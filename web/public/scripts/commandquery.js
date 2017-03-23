var authResponse = {};

$(document).ready(function() {
  checkAuth(function(data) {
    authResponse = data;
    commandquery();
    channelquery();
  }, getParameterByName('channelid'));
});

function channelquery() {
  $.getJSON('api/v1/info', function(appinfo) {
    $.getJSON('/api/v1/channel?id=' + getParameterByName('channelid'), function(data) {
      checkAuth(function(authdata) {
        if(!checkCommandPower(authdata.commandpower, 50)) {
          return;
        }
        var cookie = JSON.parse(getCookieByName('login'));

        if(cookie._id != data.data._id) {
          return;
        }

        if(!data.data) {
          data.data = {};
        }
        if(data.status == 404 || !data.data.shouldJoin) {
          var channelid = cookie._id;
          command = '!joinme';
          $('#status').append('<input class="remove_button" id="join_button" type="button" value="Join My Channel" onclick="sendJoinCommand(channelid, command);" />');
        } else {
          var channelid = appinfo.appinfo.defaultchannelid;
          command = '!partme';
          $('#status').append('<input class="remove_button" id="part_button" type="button" value="Leave My Channel" onclick="sendPartCommand(channelid, command);" />');
        }
      }, getParameterByName('channelid'));
    });
  });
}

function sendJoinCommand(channel, msg) {
  var cookie = JSON.parse(getCookieByName('login'));
  $.getJSON('api/v1/executecommand?channelid=' + channel + '&message=' + encodeURIComponent(msg) +
  '&oauth_token=' + cookie.access_token, function(data) {
    console.log(data);
    commandquery();
    channelquery();
  });
}

function sendPartCommand(channel, msg) {
  var cookie = JSON.parse(getCookieByName('login', document.cookies));
  $.getJSON('api/v1/executecommand?channelid=' + channel + '&message=' + msg+
  '&oauth_token=' + cookie.access_token, function(data) {
    console.log(data);
    commandquery();
    channelquery();
  });
}

function commandquery() {
  $('#clist').empty();
  $('#status').empty();
  $('#addcommand').remove();
  $('#join_button').remove();
  $('#part_button').remove();

  $.getJSON('api/v1/getchannel?channelid=' + getParameterByName('channelid'), function(cd) {
    var logo = cd.logo;
    if(cd.logo == null) {
      logo = './images/private/no_picture.png';
    }
    $('#status').append('<p></p>').append(
      '<img id=channelimg src=' + logo + '>'
    ).append(
      '<figcaption>' + cd.name + '</figcaption>'
    )
  });

  var channelid = getParameterByName('channelid');
  var cookie = {};
  try {
    cookie = JSON.parse(getCookieByName('login', document.cookie)); // get channel id saved in cookie
  } catch(err) {
    console.log(err);
  }
  var page = getParameterByName('page');

  // add new command button is id is 0
  if(checkCommandPower(authResponse.commandpower, 25)) {
    $('#status').append(
      '<input class="remove_button" id=addcommand type="button" value="New Command" onclick="newCommandPromt();" />'
    ).append('</br>');
  }
  if(checkCommandPower(authResponse.commandpower, 25)) {
    $('#clist').append($('<tr></tr>').append('<td>Command Name</td>').append('<td>Remove Command</td>'));
  } else {
    $('#clist').append($('<tr></tr>').append('<td>Command Name</td>'));
  }

  if(page == 0) {
    $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent('#internal#'), function(data) {
      $.each(data.data, function(key, val) {
        $('#clist').append('<tr></tr>').append(
            $('<td></td>').append(
              '<a href=./commandview?commandid=' + val._id + '>' + val.name[0] + '</a>'
            )
        );
        if(checkCommandPower(authResponse.commandpower, 25)) {
          $('#clist').append($('<td></td>')
          .append('This Command Cannot Be Removed'));
        }
      });
      getCommandList();
    });
  } else {
    getCommandList();
  }
}


function getCommandList() {
  $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&items=20&channelid=" + encodeURIComponent(channelid), function(data) {
    $.each(data.data, function(key, val) {
      if(checkCommandPower(authResponse.commandpower, 25)) {
        $('#clist').append('<tr id=tr_' + val._id + '>HI</tr>').append(
            $('<td id=td1_' + val._id + '></td>').append(
              '<a href=./commandview?commandid=' + val._id + '>' + val.name[0] + '</a>'
            )
        ).append($('<td id=td2_' + val._id + '></td>')
        .append('<input class="remove_button" id="' + val._id + '" type="button" value="Remove" onclick="removeCommandPopup(this.id);" />'));
      } else {
        $('#clist').append('<tr id=tr_' + val._id + '></tr>').append(
            $('<td id=td1_' + val._id + '></td>').append(
              '<a href=./commandview?commandid=' + val._id + '>' + val.name[0] + '</a>'
            )
        );
      }
    });
  });
}
