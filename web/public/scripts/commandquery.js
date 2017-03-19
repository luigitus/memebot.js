$(document).ready(function() {
  var channelid = getParameterByName('channelid');
  var cookie = JSON.parse(getCookieByName('login', document.cookie)); // get channel id saved in cookie
  var page = getParameterByName('page');

  // add new command button is id is 0
  if(cookie._id == channelid) {
    $('#container').append(
      '<a href="./newcommand"><h4>New Command</h4></a>'
    );
  }

  if(page == 0) {
    $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent('#internal#'), function(data) {
      $.each(data.data, function(key, val) {
        $('#clist').append(
            $('<li></li>').append(
              '<a href=./commandview?commandid=' + val._id + '>' + val.name[0] + '</a>'
            )
        );
      });
    });
  }
  $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent(channelid), function(data) {
    $.each(data.data, function(key, val) {
      if(cookie._id == channelid) {
        $('#clist').append(
            $('<li></li>').append(
              '<a href=./commandview?commandid=' + val._id + '>' + val.name[0] + '</a>'
            ).append('  <input class="remove_button" id="' + val._id + '" type="button" value="Remove" onclick="removeCommandButton();" />')
        );
      } else {
        $('#clist').append(
            $('<li></li>').append(
              '<a href=./commandview?commandid=' + val._id + '>' + val.name[0] + '</a>'
            )
        );
      }
    });
  });
});
