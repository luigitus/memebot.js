var authResponse = {};

$(document).ready(function() {
  checkAuth(function(data) {
    authResponse = data;
    commandquery();
  }, getParameterByName('channelid'));
});

function commandquery() {
  $('#clist').empty();
  $('#status').empty();
  $('#addcommand').remove();
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
  $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent(channelid), function(data) {
    $.each(data.data, function(key, val) {

      $('#clist').append('<tr></tr>').append(
          $('<td></td>').append(
            '<a href=./commandview?commandid=' + val._id + '>' + val.name[0] + '</a>'
          )
      );
      if(checkCommandPower(authResponse.commandpower, 25)) {
        $('#clist').append($('<td></td>')
        .append('<input class="remove_button" id="' + val._id + '" type="button" value="Remove" onclick="removeCommandPopup(this.id);" />'));
      }
    });
  });
}
