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

function pointCompassAtStation(data, currentPos) {
  var distance = data.distance
  // get latlon from station
  if(showWhat == 'bikes') {
    $("#deets .showbikes .dist").text(distanceStringFromM(data.distance));
  } else {
    $("#deets .showracks .dist").text(distanceStringFromM(data.distance));
  }
  // work out heading
  $('#arrow').css('-webkit-transform','rotate(' + data.arc + 'deg)');		
}

