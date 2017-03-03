function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getCookieByName(cookiename, cookiedata) {
  var cookies = cookiedata.split('; ');
  for(var call in cookies) {
    var x = cookies[call].split('=');
    if(x[0] == cookiename) {
      return decodeURIComponent(x[1].replace(/\+/g, " "));
    }
  }

  return undefined;
}

function getAppInfo(callback) {
  $.getJSON("api/v1/info", function(data) {
    callback(data.data, data.appinfo);
  })
}

function sortString(a, b) {
  return (a < b) ? -1 : (a > b) ? 1 : 0;
}
