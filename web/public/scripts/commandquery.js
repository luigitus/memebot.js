$(document).ready(function() {
  var channelid = getParameterByName('channelid');
  var page = getParameterByName('page');
  if(page == 0) {
    $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent('#internal#'), function(data) {
      $.each(data.data, function(key, val) {
        $('#clist').append(
            $('<li></li>').append(
              '<a href=./commandview?commandid=' + key + '>' + val.name[0] + '</a>'
            )
        );
      });
    });
  }
  $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent(channelid), function(data) {
    $.each(data.data, function(key, val) {
      $('#clist').append(
          $('<li></li>').append(
            '<a href=./commandview?commandid=' + key + '>' + val.name[0] + '</a>'
          )
      );
    });
  });
});
