$(document).ready(function() {
  var page = getParameterByName('page');
  if(typeof page === 'undefined') {
    page = 0;
  }
  getAppInfo(function(data, appinfo) {
    $.getJSON("api/v1/channellist?page=" + encodeURIComponent(page), function(data) {
      $.each(data.data, function(key, val) {
        $('#clist').append(
            $('<li></li>').append(
              '<a href=./commandlist?page=0&channelid=' + val._id + '>' +
              val.name + '</a>'
            )
        );
      });
    });
  });
});
