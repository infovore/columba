// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function() {
  $("#deets").hide();
  if(navigator.geolocation) {
    // send latlong to backend
      // receive json representation of the nearest station and for now, paste
      // it into the window
      
      // store the heading of the nearest station in the window
      // update markup as appropriate
      // store direction on window

    postLocation()

    setInterval(postLocation,3000);

      window.addEventListener('deviceorientation', function(e) {
        // get the arc value from north we computed and stored earlier
        if(e.webkitCompassHeading) {
          compassHeading = e.webkitCompassHeading;
          $('#rose').css('-webkit-transform','rotate(-' + compassHeading + 'deg)');		
        }
      });
  }
});

function postLocation() {
  navigator.geolocation.getCurrentPosition(function(position) {
    $.post('/stations/nearest', {lat: position.coords.latitude, lon: position.coords.longitude}, function(data) {
      console.log(data);
      $("#deets .stationname").text(data.name);
      //$("#deets .dist").text(data);
      $("#deets .free").text(data.number_empty_docks);
      $("#deets").show();

      pointCompassAtStation(data, position);
    });
  });
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
  var distanceInK = km.toFixed(2);
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
  var distance = distanceBetween(data.lat, data.lon, currentPos.coords.latitude, currentPos.coords.longitude);
  // get latlon from station
  $("#deets .dist").text(distanceStringFromKm(distance[0]));
  // work out heading
  $('#arrow').css('-webkit-transform','rotate(' + distance[1] + 'deg)');		

}

