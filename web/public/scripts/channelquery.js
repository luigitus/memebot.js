$(document).ready(function() {
  var page = getParameterByName('page');
  if(typeof page === 'undefined') {
    page = 0;
  }
  getAppInfo(function(data, appinfo) {
    $.getJSON("api/v1/channellist?page=" + encodeURIComponent(page), function(data) {

      var channeldata = {};
      $.each(data.data, function(key, val) {
        $.getJSON('api/v1/getchannel?channelid=' + val._id, function(cd) {
          if($('#' + key).length > 0) {
            addLogo(key, val, cd)
          }
          channeldata[key] = cd;
        });
      });

      $.each(data.data, function(key, val) {
        if(val.isLive) {
          $('#clist_live').append(
              $('<li class=channelli id='+ key +'></li>').append(
                '<a href=./commandlist?page=0&channelid=' + val._id + '>' +
                '<figcaption>' + val.name.replace('#', '') + '</figcaption></a>'
            )
          );
        } else {
          $('#clist').append(
              $('<li class=channelli id='+ key +'></li>').append(
                '<a href=./commandlist?page=0&channelid=' + val._id + '>' +
                '<figcaption>' + val.name.replace('#', '') + '</figcaption></a>'
            )
          );
        }
      });

      var timer = setInterval(function() {
        if(Object.keys(channeldata).length != data.data.length) {
          return;
        } else {
          clearInterval(timer);
        }
        $.each(data.data, function(key, val) {
          if($('#image' + key).length == -1) {
            addLogo(key, val, channeldata[key])
          }
        });
      }, 50);
    });
  });
});

function addLogo(key, val, channeldata) {
  var logo = channeldata.logo;

  if(logo == null) {
    logo = './images/private/no_picture.png';
  }
  $('#' + key).append(
    '<a id=image' + key +  'href=./commandlist?page=0&channelid=' + val._id + '>'
    + '<img class="login_button" border="0" alt="' + val.name
    + '" src="' + logo + '">'
    + '</a>'
  );
}
