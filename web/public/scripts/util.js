var keys = '';

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

function getRandomInt(min, max) {
  if(typeof min === 'undefined') {
    min = 0;
  } else if(typeof max === 'undefined') {
    max = Number.MAX_SAFE_INTEGER
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// memes
window.onkeyup = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;
   var sound = ['http://66.90.93.122/ost/contra-arcade-/hbanybrhlp/01-contra.mp3',
    'http://66.90.93.122/ost/contra-arcade-/mncykvgimj/03-battle-in-the-jungle.mp3',
    'http://66.90.93.122/ost/contra-arcade-/fegmyjwlax/04-labyrinthine-fortress-1.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/kfrsmzccqe/01-title.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/owesivwgxc/03-stage-1-jungle-stage-7-hangar.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/xcvdtyvqdt/04-stage-clear.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/qgwawrkvak/05-stage-2-base-1-stage-4-base-2.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/quicsuqxhn/06-base-boss.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/japcksoady/07-stage-3-waterfall.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/bdfxgfdyez/08-stage-5-snow-field.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/qziytfubjr/09-stage-6-energy-zone.mp3',
    'http://66.90.93.122/ost/contra-ost-nes-1988-/cxpkkzmliw/12-ending.mp3'];
   if (key == 38) {
       keys = keys + 'u';
   } else if (key == 40) {
       keys = keys + 'd';
   } else if(key == 37){
     keys = keys + 'l';
   } else if(key == 39) {
     keys = keys + 'r';
   } else if(key == 66) {
     keys = keys + 'b';
   } else if(key == 65) {
     keys = keys + 'a';
   } else if(key == 13) {
     if(keys == 'uuddlrlrba') {
       setInterval(function(){
        $('header').append(
          '<img src="https://media.giphy.com/media/DpXqHdILXRRDi/giphy.gif" alt="Contra gif" height="50" width="50">'
        );
       }, 3000);

       var audio = new Audio(sound[getRandomInt(0, sound.length - 1)]);
       audio.play();
     }
     keys = '';
   } else {
     keys = '';
   }
}
