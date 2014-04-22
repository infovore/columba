// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function() {
  $("html").on("touchmove", false);
  window.showWhat = 'racks';

  $("#deets").hide();

  showAppropriate(showWhat);

  $(".about-toggle").click(function() {
    $("#about").fadeToggle('fast');
    return false;
  });

  $(".close").click(function() {
    $("#about").fadeOut('fast');
    return false;
  });

  if(navigator.geolocation) {
    postLocation()

    setInterval(postLocation,1000);

    window.addEventListener('deviceorientation', function(e) {
      // get the arc value from north we computed and stored earlier
      if(e.webkitCompassHeading) {
        window.compassHeading = e.webkitCompassHeading + window.orientation;
        $('#rose').css('-webkit-transform','rotate(-' + window.compassHeading + 'deg)');		
        // get position and
        navigator.geolocation.getCurrentPosition(function(position) {
          updateCompass(position);
        });
      }
    });
  }

  $("#compass").click(function(e) {
    if(window.showWhat == 'bikes') {
      window.showWhat = 'racks';
    } else {
      window.showWhat = 'bikes';
    }
    postLocation();

    e.preventDefault();
  });
});

function showAppropriate(what) {
  if(what == 'bikes') {
    $(".showbikes").show();
    $(".showracks").hide();
  } else {
    $(".showbikes").hide();
    $(".showracks").show();
  }
}


function postLocation() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var postData;
    var params = urlParams();
    postData = {lat: position.coords.latitude,
                lon: position.coords.longitude}

    if('name' in params) {
      if(window.compassHeading) {
        postData.heading = window.compassHeading;
      }
      postData.name = params.name;
      console.log("I'd log my data for user " + params.name);
      console.log(postData);
    }

    $.post('/stations/nearest', postData, function(data) {
      //console.log(data);
      updateDisplay(data, position);
    });

  });
}

function updateDisplay(data, position) {
  showAppropriate(window.showWhat);

  $("#deets .showracks .stationname").text(data.racks.name);
  $("#deets .showracks .free").text(data.racks.number_empty_docks);
  $("#deets .showbikes .stationname").text(data.bikes.name);
  $("#deets .showbikes .free").text(data.bikes.number_bikes);
  $("#deets").fadeIn();

  window.racksStation = data.racks;
  window.bikesStation = data.bikes;
  updateCompass(position);
}

function updateCompass(position) {
  if(window.showWhat == 'bikes') {
    pointCompassAtStation(window.bikesStation, position);
  } else {
    pointCompassAtStation(window.racksStation, position);
  }
}

function distanceStringFromKm(km) {
  var distanceInK = km.toFixed(3);
  var string = "";
  if(distanceInK >= 1) {
    string = distanceInK + "km";
  } else if(distanceInK >= 0.01) {
    distanceInM = distanceInK * 1000;
    string = distanceInM + "m";
  } else {
    string = "here!";
  }
  return string;
}

function distanceStringFromM(m) {
  var km = m / 1000;
  var distanceInK = km.toFixed(3);
  var string = "";
  if(distanceInK >= 1) {
    string = distanceInK + "km";
  } else if(distanceInK >= 0.01) {
    distanceInM = distanceInK * 1000;
    string = distanceInM + "m";
  } else {
    string = "here!";
  }
  return string;
}

function distanceBetween(lat1,lon1,lat2,lon2){
  var R = 6371; // km
  var dLat = (lat2-lat1) * Math.PI / 180;
  var dLon = (lon2-lon1) * Math.PI / 180;
  var lat1 = (lat1) * Math.PI / 180;
  var lat2 = (lat2) * Math.PI / 180;

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;

  var y = Math.sin(dLon) * Math.cos(lat2);
  var x = Math.cos(lat1)*Math.sin(lat2) -
          Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
  var brng = Math.atan2(y, x).toDeg();

  return [d,brng]
}

function pointCompassAtStation(data, currentPos) {
  //var distance = data.distance

  var distanceAndArc = distanceBetween(currentPos.coords.latitude, currentPos.coords.longitude, data.lat, data.lon);
  var distance = distanceAndArc[0];
  var arc = distanceAndArc[1];
  //
  // get latlon from station
  if(showWhat == 'bikes') {
    $("#deets .showbikes .dist").text(distanceStringFromKm(distance));
  } else {
    $("#deets .showracks .dist").text(distanceStringFromKm(distance));
  }
  // work out heading
  $('#arrow').css('-webkit-transform','rotate(' + arc + 'deg)');		
}

/** Converts numeric degrees to radians */
if (typeof Number.prototype.toRad == 'undefined') {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

/** Converts radians to numeric (signed) degrees */
if (typeof Number.prototype.toDeg == 'undefined') {
  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  }
}

function urlParams() {
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

    params = {};
    while (match = search.exec(query))
       params[decode(match[1])] = decode(match[2]);

    return params;
}
