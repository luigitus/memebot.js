$(document).ready(function() {
  var channelid = getParameterByName('channelid');
  var page = getParameterByName('page');
  if(page == 0) {
    $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent('#internal#'), function(data) {
      $.each(data.data, function( key, val ) {
        $('#clist').append(
            $('<li></li>').append(
              val.name[0]
            )
        );
      });
    });
  }
  $.getJSON("api/v1/commandlist?page=" + encodeURIComponent(page) + "&channelid=" + encodeURIComponent(channelid), function(data) {
    $.each(data.data, function( key, val ) {
      $('#clist').append(
          $('<li></li>').append(
            val.name[0]
          )
      );
    });
  });
});
