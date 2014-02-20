// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function() {
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
        compassHeading = e.webkitCompassHeading + window.orientation;
        $('#rose').css('-webkit-transform','rotate(-' + compassHeading + 'deg)');		
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
    $.post('/stations/nearest', {lat: position.coords.latitude, lon: position.coords.longitude}, function(data) {
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

  arc = Math.atan2(dLat , dLon) * 180 / Math.PI

  return [d,arc]
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

function pointCompassAtStation(data, currentPos) {
  var distance = distanceBetween(currentPos.coords.latitude, currentPos.coords.longitude, data.lat, data.lon);
  // get latlon from station
  if(showWhat == 'bikes') {
    $("#deets .showbikes .dist").text(distanceStringFromKm(distance[0]));
  } else {
    $("#deets .showracks .dist").text(distanceStringFromKm(distance[0]));
  }
  // work out heading
  $('#arrow').css('-webkit-transform','rotate(' + distance[1] + 'deg)');		
}

